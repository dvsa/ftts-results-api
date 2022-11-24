import { AfterSendError } from '../../shared/errors/after-send-error';
import { CrmError } from '../../shared/errors/crm-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { getIdentifiers, getSarasIdentifiers } from '../../shared/utils/identifiers';
import { BusinessTelemetryEvent, logger } from '../../shared/utils/logger';
import { QueueRecordServiceBusMessage } from '../interfaces';
import QueueService from './queue-service';
import SenderService from './sender-service';

export class ResultProcessor {
  public static async processResult(result: QueueRecordServiceBusMessage) {
    logger.debug('ResultProcessor::processResult: New message to be sent to CRM', {
      ...getIdentifiers(result.body),
      payload: result.body,
      serviceBusProps: result.applicationProperties,
    });
    if (!result.body) {
      logger.warn('ResultProcessor::processResult: empty message', {
        ...getIdentifiers(result.body),
      });
      await QueueService.deadLetterResult(result, { deadLetterReason: 'Empty message', deadLetterErrorDescription: 'Received an empty message from arrival queue' });
      return;
    }
    logger.event(BusinessTelemetryEvent.RES_CONSUMER_PROCESSING_BOOKING, `ResultProcessor::processResult: Processing Result ${result.body.AppointmentId as string}`, {
      ...getIdentifiers(result.body),
      ...getSarasIdentifiers(result.body),
    });

    try {
      const startTime = Date.now();
      await SenderService.sendResult(result);

      const endTime = Date.now();
      logger.event(BusinessTelemetryEvent.RES_CONSUMER_SUCCESSFULLY_SAVED, 'ResultProcessor::processResult: Successfully saved result to CRM', {
        ...getIdentifiers(result.body),
        ...getSarasIdentifiers(result.body),
        processedInSeconds: (endTime - startTime) / 1000,
      });

      await QueueService.completeResult(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.error(error, 'ResultProcessor::processResult: Validation error');
        await QueueService.deadLetterResult(result, { deadLetterReason: 'ValidationError', deadLetterErrorDescription: error.message });
      } else if (error instanceof CrmError) {
        logger.error(error, 'ResultProcessor::processResult: Failed to send to crm');
        await QueueService.abandonResult(result);
      } else if (error instanceof AfterSendError) {
        logger.error(error, 'ResultProcessor::processResult: Failed after sending to crm');
        await QueueService.abandonResult(result, { sentToCrmAt: result?.applicationProperties?.sentToCrmAt || new Date(Date.now()).toISOString() });
      } else {
        logger.error(error as Error, `ResultProcessor::processResult: Unknown error - ${(error as Error)?.message}`);
        await QueueService.abandonResult(result);
      }
    }
  }
}
