import { AzureFunction, Context } from '@azure/functions';
import { nonHttpTriggerContextWrapper } from '@dvsa/azure-logger';
import { withEgressFiltering } from '@dvsa/egress-filtering';
import { SARASResultQueueRecord } from '../interfaces';
import { logger } from '../../shared/utils/logger';
import { ALLOWED_ADDRESSES, onInternalAccessDeniedError } from '../services/egress-filter';
import { processMessages } from './controllers/result-sender-timer-controller';

export const resultSenderTrigger: AzureFunction = async (): Promise<void> => processMessages();

export const index = async (context: Context, message: SARASResultQueueRecord): Promise<void> => nonHttpTriggerContextWrapper(
  withEgressFiltering(resultSenderTrigger, ALLOWED_ADDRESSES, onInternalAccessDeniedError, logger),
  context,
  message,
);
