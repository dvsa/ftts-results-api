import { getIdentifiers } from '../../shared/utils/identifiers';
import { logger } from '../../shared/utils/logger';
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';
import { newCrmClient } from '../crm/crm-client';
import { CrmError } from '../crm/crm-error';
import { SARASResultQueueRecord } from '../interfaces';

export default class CrmService {
  public static sendResultToCrm = async (data: SARASResultQueueRecord, testHistoryContentId: string): Promise<CRMBookingProduct | undefined> => {
    try {
      logger.info('CRMService::sendResultToCrm: Attempting to add Result to CRM...', {
        ...getIdentifiers(data),
      });
      const crmClient = newCrmClient();
      return await crmClient.postTestResult(data, testHistoryContentId);
    } catch (crmError) {
      logger.error(crmError as Error, 'CRMService::sendResultToCrm: Failed to add result to CRM', {
        ...getIdentifiers(data),
      });
      throw new CrmError(crmError as Error);
    }
  };
}
