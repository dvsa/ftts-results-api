import { AzureFunction, Context } from '@azure/functions';

import ResultSenderController from './controllers/result-sender-controller';
import { withEgressFiltering } from '../services/egress-filter';
import { logger } from '../../shared/utils/logger';
import { QueueMessage } from '../interfaces';

const resultSenderTrigger: AzureFunction = async (context: Context, message: QueueMessage): Promise<void> => {
  logger.event('Launch', 'Results Sender');

  logger.dependency(context, 'Arrival Queue', 'Getting message from arrival queue', {
    dependencyTypeName: 'AMQP',
    target: 'Arrival Queue',
    duration: Date.now() - (context.bindingData.sendStartDate || Date.now()),
    resultCode: 200,
    success: true,
    id: context.traceContext.traceparent,
  });

  return ResultSenderController.processResultsQueueMessage(context, message);
};

export default withEgressFiltering(resultSenderTrigger);
