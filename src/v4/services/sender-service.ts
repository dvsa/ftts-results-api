import { CrmService, QueueService } from '.';
import config from '../../shared/config';
import { isOwedCompensationBooking } from '../../shared/crm/booking-product/booking-product';
import { CRMBookingProduct, CRMOrigin } from '../../shared/crm/booking-product/interfaces';
import { AfterSendError } from '../../shared/errors/after-send-error';
import { CrmError } from '../../shared/errors/crm-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { SARASStatus, SARASTestType } from '../../shared/interfaces';
import { getIdentifiers } from '../../shared/utils/identifiers';
import { BusinessTelemetryEvent, logger } from '../../shared/utils/logger';
import { QueueRecordServiceBusMessage, SARASResultQueueRecord } from '../interfaces';
import { getSarasTestTypeLabel } from '../utils/mapper';
import { QueueRecordValidator } from '../utils/queue-record-validator';
import { v4 as uuid4 } from 'uuid';

class SenderService {
  public static async sendResult(serviceBusMessage: QueueRecordServiceBusMessage): Promise<void> {
    const message = serviceBusMessage.body;
    logger.info(`SenderService::sendResult: Processing result ${message.AppointmentId || ''}`, {
      ...getIdentifiers(message),
    });
    logger.debug(`SenderService::sendResult: Processing raw result ${message.AppointmentId || ''}`, {
      ...getIdentifiers(message),
      message,
      serviceBusProps: serviceBusMessage.applicationProperties,
    });

    SenderService.validateResultRecord(message);

    // Create Test History Request
    const testHistoryContentId = uuid4();

    let bookingProduct;
    if (!serviceBusMessage?.applicationProperties?.sentToCrmAt) {
      bookingProduct = await SenderService.sendToCrm(message, testHistoryContentId);
    } else {
      logger.info('SenderService::sendResult: Result has already been sent to crm', {
        ...getIdentifiers(message),
        sentToCrmAt: serviceBusMessage?.applicationProperties?.sentToCrmAt,
      });
    }

    await SenderService.sendToPaymentsQueue(message, bookingProduct);

    if (config.featureToggles.digitalResultsEmailInfo) {
      if (SenderService.testTypeAllowedToSendToDigitalResult(message.TestInformation.TestType)) {
        const origin = bookingProduct?.ftts_bookingid.ftts_origin;
        if (!origin) {
          const error = new AfterSendError('SenderService::sendResult: unknown booking origin');
          logger.error(error as Error, 'SenderService::sendResult: unknown booking origin', { ...getIdentifiers(message) });
          throw error;
        }
        if (bookingProduct?.ftts_bookingid.ftts_origin === CRMOrigin.CitizenPortal) {
          await SenderService.sendToDigitalResultsQueue(message, bookingProduct);
        }
      }
    }

    if (config.featureToggles.testResultPersister) {
      if (!serviceBusMessage?.applicationProperties?.sentToCrmAt) {
        await SenderService.sendToTestResultPersisterQueue(message, testHistoryContentId);
      } else {
        logger.info('SenderService::sendResult: Result has already been sent to crm', {
          ...getIdentifiers(message),
          sentToCrmAt: serviceBusMessage?.applicationProperties?.sentToCrmAt,
        });
      }

    }
  }

  private static testTypeAllowedToSendToDigitalResult(testType: SARASTestType): boolean {
    const sarasTestTypeLabel = getSarasTestTypeLabel(testType);
    if (!sarasTestTypeLabel) {
      logger.warn(`SenderService::testTypeAllowedToSendToDigitalResult: unknown SARAS test type ${testType}`);
      return false;
    }
    return !config.featureToggles.digitalResultsDisabledTestTypes.split(',').includes(sarasTestTypeLabel);
  }

  private static validateResultRecord(message: SARASResultQueueRecord): void {
    try {
      QueueRecordValidator.validateResultQueueRecord(message);
    } catch (error) {
      logger.error(error as Error, 'SenderService::validateResultRecord: result failed validation', {
        ...getIdentifiers(message),
      });
      throw new ValidationError(`result failed validation ${(error as Error)?.message}`);
    }
  }

  private static async sendToCrm(message: SARASResultQueueRecord, testHistoryContentId: string): Promise<CRMBookingProduct | undefined> {
    try {
      return await CrmService.sendResultToCrm(message, testHistoryContentId);
    } catch (error) {
      logger.error(error as Error, 'SenderService::sendToCrm failed to send result to crm', {
        ...getIdentifiers(message),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error,
      });
      throw new CrmError(`failed to send result to crm ${(error as Error)?.message}`);
    }
  }

  private static async sendToPaymentsQueue(message: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct): Promise<void> {
    try {
      if (bookingProduct && isOwedCompensationBooking(bookingProduct)) {
        logger.event(BusinessTelemetryEvent.RES_BOOKING_PRODUCT_OWED_COMPENSATION_BOOKING, 'SenderService::processResultsQueueMessage: Is owed compensation booking, not sending result to payments queue', {
          ...getIdentifiers(message),
          bookingProductReference: bookingProduct.ftts_reference,
          bookingProductId: bookingProduct.ftts_bookingproductid,
        });
      } else {
        await QueueService.sendResultStatusToPaymentsQueue(message);
      }
    } catch (error) {
      logger.error(error as Error, 'SenderService::sendToPaymentsQueue failed to send to send to payments queue', { ...getIdentifiers(message) });
      throw new AfterSendError(`failed to send to payments queue ${(error as Error)?.message}`);
    }
  }

  private static async sendToDigitalResultsQueue(message: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct): Promise<void> {
    try {
      if (message.TestInformation.OverallStatus === SARASStatus.PASS || message.TestInformation.OverallStatus === SARASStatus.FAIL) {
        logger.info('SenderService::sendToDigitalResultsQueue: sending result to DigitalResults queue', {
          ...getIdentifiers(message),
          bookingProductReference: bookingProduct?.ftts_reference,
          bookingProductId: bookingProduct?.ftts_bookingproductid,
        });
        await QueueService.sendResultToDigitalResultsQueue(message, bookingProduct);
      }
    } catch (error) {
      logger.error(error as Error, 'SenderService::sendToDigitalResultsQueue: failed to send to send to DigitalResults queue', { ...getIdentifiers(message) });
      throw new AfterSendError(`SenderService::sendToDigitalResultsQueue: failed to send to DigitalResults queue ${(error as Error)?.message}`);
    }
  }

  private static async sendToTestResultPersisterQueue(message: SARASResultQueueRecord, testHistoryContentId: string): Promise<void> {
    try {
      logger.info('SenderService::sentToTestResultPersisterQueue: sending result to DigitalResults queue', {
        ...getIdentifiers(message),
      });
      await QueueService.sendTestResultsToPersister(message, testHistoryContentId);
    } catch (error) {
      logger.error(error as Error, 'SenderService::sentToTestResultPersisterQueue: failed to send to send to TR Persister queue', { ...getIdentifiers(message) });
      throw new AfterSendError(`SenderService::sendToTestResultPersisterQueue: failed to send to TR Persister queue ${(error as Error)?.message}`);
    }

  }
}

export default SenderService;
