import { Context } from '@azure/functions';
import { getIdentifiers, logger } from '../../shared/utils/logger';
import { newCrmClient } from '../crm/crm-client';
import { CrmError } from '../crm/crm-error';
import { QueueRecord } from '../interfaces';

export default class CrmService {
  public static sendResultToCrm = async (context: Context, data: QueueRecord): Promise<void> => {
    if (!data.sentToCrmAt) {
      try {
        logger.info(`Attempting to add Result to CRM... ${getIdentifiers(data)}`, { context });
        const crmClient = newCrmClient();
        await crmClient.postTestResult(data);
        const date = new Date(Date.now());
        data.sentToCrmAt = date.toISOString();
      } catch (crmError) {
        throw new CrmError(crmError);
      }
    } else {
      logger.info(`Skipping attempt to add Result to CRM - Result already added ${getIdentifiers(data)}`, { context });
    }
  };
}
