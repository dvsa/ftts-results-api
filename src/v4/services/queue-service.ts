import { DeadLetterOptions } from '@azure/service-bus';
import arrivalQueue from '../queues/arrival-queue';
import paymentEventsQueue from '../queues/payment-events-queue';
import digitalResultsQueue from '../queues/digital-results-queue';
import { SARASResultQueueRecord, QueueRecordServiceBusMessage, PaymentEventError, DigitalResultsError } from '../interfaces';
import { logger, BusinessTelemetryEvent } from '../../shared/utils/logger';
import { getIdentifiers, getSarasIdentifiers } from '../../shared/utils/identifiers';
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';
import TestResultsPersisterQueue from '../queues/test-results-persister-queue';
import { TestResultsError } from '../interfaces/test-results';

export default class QueueService {
  public static sendResultToArrivalQueue = async (queueRecord: SARASResultQueueRecord): Promise<void> => {
    try {
      logger.log('QueueService::sendResultToArrivalQueue: Attempting to add Result to arrival queue', {
        ...getIdentifiers(queueRecord),
      });
      await arrivalQueue.sendMessage(queueRecord);
    } catch (error) {
      logger.error(error as Error, 'QueueService::sendResultToArrivalQueue: Failed adding result to arrival queue', {
        ...getIdentifiers(queueRecord),
      });
      logger.logEvent(
        BusinessTelemetryEvent.RES_API_ENQUEUE_ERROR,
        'Results API failed to enqueue the result on the result arrival queue',
      );
      throw error;
    }
  };

  public static retrieveResultsFromArrivalQueue = async (numberOfResults?: number): Promise<QueueRecordServiceBusMessage[]> => {
    try {
      logger.info('QueueService::retrieveResultsFromArrivalQueue: attempting to retrieve results from Arrival queue...');
      const messages = await arrivalQueue.receiveMessages(numberOfResults);
      logger.debug('QueueService::retrieveResultsFromArrivalQueue: retrieved message response', {
        messages: messages.map((message) => message?.body),
      });

      return messages;
    } catch (error) {
      logger.event(BusinessTelemetryEvent.RES_CONSUMER_QUEUE_RETRIEVE_ERROR, 'failed to retrieve results from arrival queue');
      logger.error(error as Error, 'QueueService::retrieveResultsFromArrivalQueue: failed to retrieve results from arrival queue');
      throw error;
    }
  };

  public static completeResult = async (queueRecordServiceBusMessage: QueueRecordServiceBusMessage): Promise<void> => {
    try {
      logger.debug('QueueService::completeResult: completing message...', { message: queueRecordServiceBusMessage?.body });
      logger.info('QueueService::completeResult: completing message...', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
      await arrivalQueue.completeMessage(queueRecordServiceBusMessage);
      logger.info('QueueService::completeResult: successfully completed message', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
    } catch (error) {
      logger.error(error as Error, 'QueueService::completeResult: failed to complete result in arrival queue', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
      throw error;
    }
  };

  public static abandonResult = async (queueRecordServiceBusMessage: QueueRecordServiceBusMessage, serviceBusProps?: Record<string, unknown>): Promise<void> => {
    try {
      logger.debug('QueueService::abandonResult: abandoning message...', { message: queueRecordServiceBusMessage?.body, serviceBusProps });
      logger.info('QueueService::abandonResult: abandoning message...', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
      await arrivalQueue.abandonMessage(queueRecordServiceBusMessage, serviceBusProps);
      logger.info('QueueService::abandonResult: abandoned message', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
    } catch (error) {
      logger.error(error as Error, 'QueueService::abandonResult: failed to abandon result in arrival queue');
      throw error;
    }
  };

  public static deadLetterResult = async (queueRecordServiceBusMessage: QueueRecordServiceBusMessage, options?: DeadLetterOptions): Promise<void> => {
    try {
      logger.debug('QueueService::deadLetterResult: dead lettering message...', { message: queueRecordServiceBusMessage?.body, options });
      logger.info('QueueService::deadLetterResult: dead lettering message...', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
      await arrivalQueue.deadLetterMessage(queueRecordServiceBusMessage, options);
      logger.info('QueueService::deadLetterResult: dead lettered message', { ...getIdentifiers(queueRecordServiceBusMessage?.body) });
    } catch (error) {
      logger.error(error as Error, 'QueueService::deadLetterResult: failed to dead letter result in arrival queue');
      throw error;
    }
  };

  public static sendResultStatusToPaymentsQueue = async (data: SARASResultQueueRecord): Promise<void> => {
    try {
      logger.info('QueueService::sendResultStatusToPaymentsQueue: Attempting to add result status to Payment events queue...', {
        ...getIdentifiers(data),
      });
      await paymentEventsQueue.sendMessages(data);
    } catch (error) {
      logger.error(error as Error, 'QueueService::sendResultStatusToPaymentsQueue: Failed adding result status to payment events queue', {
        ...getIdentifiers(data),
      });
      logger.logEvent(
        BusinessTelemetryEvent.RES_CONSUMER_PAYMENT_EVENT_ERROR,
        'Result Consumer Failed to send information to the Payments Events Queue',
        {
          ...getIdentifiers(data),
        },
      );
      throw new PaymentEventError((error as Error).message);
    }
  };

  public static sendResultToDigitalResultsQueue = async (results: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct): Promise<void> => {
    try {
      logger.info('QueueService::sendResultToDigitalResultsQueue: Attempting to add results to digital results queue...', {
        ...getIdentifiers(results),
        testEndTime: getSarasIdentifiers(results).testEndTime,
      });
      await digitalResultsQueue.sendMessages(results, bookingProduct);
    } catch (error) {
      logger.error(error as Error, 'QueueService::sendResultToDigitalResultsQueue: Failed adding result status to digital results queue', {
        ...getIdentifiers(results),
      });
      logger.logEvent(
        BusinessTelemetryEvent.RES_DIGITAL_RESULTS_EVENT_ERROR,
        'Result Consumer Failed to send information to the Digital Results Queue',
        {
          ...getIdentifiers(results),
        },
      );
      throw new DigitalResultsError((error as Error).message);
    }
  };

  public static sendTestResultsToPersister = async (results: SARASResultQueueRecord, testHistoryContentId: string): Promise<void> => {
    try {
      logger.info('QueueService::sendTestResultsToPersister: Attempting to add results to TR persister queue...', {
        ...getIdentifiers(results),
        testEndTime: getSarasIdentifiers(results).testEndTime,
      });
      await TestResultsPersisterQueue.sendMessages(results, testHistoryContentId);

    } catch (error) {
      logger.error(error as Error, 'QueueService::sendTestResultsToPersister: Failed adding result status to TR persister queue', {
        ...getIdentifiers(results),
      });
      logger.logEvent(
        BusinessTelemetryEvent.RES_TR_PERSISTER_QUEUE_ERROR,
        'Result Consumer Failed to send information to the Test Results Persister Queue',
        {
          ...getIdentifiers(results),
        },
      );
      throw new TestResultsError((error as Error).message);
    }
  };
}
