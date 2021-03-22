import Container from 'typedi';
import { Context } from '@azure/functions';
import { ValidationError as ajvValidatorError } from 'ajv';
import { ValidationError } from '../../../shared/interfaces';
import { logger, getIdentifiers } from '../../../shared/utils/logger';
import { QueueRecordValidator } from '../../utils/queue-record-validator';
import ArrivalQueue from '../../queues/arrival-queue';
import { CrmError } from '../../crm/crm-error';
import { PaymentEventError } from '../../interfaces/payment-event';
import CrmService from '../../services/crm-service';
import QueueService from '../../services/queue-service';
import { QueueMessage } from '../../interfaces';

class ResultSenderController {
  public static async processResultsQueueMessage(context: Context, message: QueueMessage): Promise<void> {
    const data = message.body;
    try {
      logger.info(`Result Sender processing message... ${getIdentifiers(data)}`, { context });
      QueueRecordValidator.validateResultQueueRecord(data);
      await CrmService.sendResultToCrm(context, data);
      await QueueService.sendResultStatusToPaymentsQueue(context, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ajvValidatorError) {
        logger.critical(`${error.message} ${getIdentifiers(data)}`, { context });
        throw error; // abandon - send to dlq
      } else if (error instanceof CrmError) {
        logger.error(error, `Crm Error - ${error.message} ${getIdentifiers(data)}`, { context });
        if (error.status === 404) {
          throw error;
        }

        const arrivalQueue: ArrivalQueue = Container.get(ArrivalQueue);
        await arrivalQueue.handleSendFailureRetry(context, data);
      } else if (error instanceof PaymentEventError) {
        const arrivalQueue: ArrivalQueue = Container.get(ArrivalQueue);
        await arrivalQueue.handleSendFailureRetry(context, data);
      } else {
        logger.error(
          error,
          `ResultSenderController::processResultsQueueMessage:: Failed to process queue message ${getIdentifiers(data)}`,
          {
            message: JSON.stringify(message),
            context,
          },
        );
        const arrivalQueue: ArrivalQueue = Container.get(ArrivalQueue);
        await arrivalQueue.handleSendFailureRetry(context, data);
      }
    }
  }
}

export default ResultSenderController;
