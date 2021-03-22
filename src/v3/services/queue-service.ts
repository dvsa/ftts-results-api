import { Context } from '@azure/functions';
import Container from 'typedi';
import PaymentEventsQueue from '../queues/payment-events-queue';
import { QueueRecord } from '../interfaces';
import { logger, getIdentifiers, BusinessTelemetryEvent } from '../../shared/utils/logger';
import { PaymentEventError } from '../interfaces/payment-event';
import ArrivalQueue from '../queues/arrival-queue';

export default class QueueService {
  public static sendResultToArrivalQueue = async (context: Context, queueRecord: QueueRecord): Promise<void> => {
    try {
      logger.log(`Attempting to add Result to arrival queue ${getIdentifiers(queueRecord)}`, {
        queueRecord,
        context,
      });
      const arrivalQueue: ArrivalQueue = Container.get(ArrivalQueue);
      await arrivalQueue.send(context, queueRecord);
    } catch (error) {
      logger.error(error, `Failed adding result to arrival queue - ${getIdentifiers(queueRecord)}`, { context });
      logger.logEvent(
        BusinessTelemetryEvent.RES_API_ENQUEUE_ERROR,
        'Results API failed to enqueue the result on the result arrival queue',
      );
      throw error;
    }
  };

  public static sendResultStatusToPaymentsQueue = async (context: Context, data: QueueRecord): Promise<void> => {
    try {
      logger.info(`Attempting to add result status to Payment events queue... ${getIdentifiers(data)}`, { context });
      const paymentEventsQueue: PaymentEventsQueue = Container.get(PaymentEventsQueue);
      await paymentEventsQueue.send(context, data);
    } catch (error) {
      logger.error(error, `Failed adding result status to payment events queue - ${getIdentifiers(data)}`, { context });
      logger.logEvent(
        BusinessTelemetryEvent.RES_CONSUMER_PAYMENT_EVENT_ERROR,
        'Result Consumer Failed to send information to the Payments Events Queue',
      );
      throw new PaymentEventError(error);
    }
  };
}
