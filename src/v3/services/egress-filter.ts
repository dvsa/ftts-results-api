import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { addressParser, EgressFilter, InternalAccessDeniedError } from '@dvsa/egress-filtering';

import config from '../../shared/config';
import { logger } from '../../shared/utils/logger';
import { QueueRecord } from '../interfaces';

const withEgressFiltering = (originalFn: AzureFunction) => async (context: Context, ...payloads: HttpRequest[] | QueueRecord[]): Promise<void> => {
  const egressFilter = EgressFilter.getInstance();
  egressFilter.allow(addressParser.parseUri(config.crm.azureAdUri));
  egressFilter.allow(addressParser.parseUri(config.crm.resourceUrl));
  egressFilter.allow(addressParser.parseSbConnectionString(config.resultsServiceBus.connectionString));
  egressFilter.allow(addressParser.parseSbConnectionString(config.paymentsServiceBus.connectionString));
  egressFilter.allowManyAddresses(addressParser.parseConnectionString(config.storage.connectionString));

  try {
    await originalFn.call(undefined, context, ...payloads);
  } catch (error) {
    if (error instanceof InternalAccessDeniedError) {
      logger.error(error, 'InternalAccessDeniedError', {
        reason: JSON.stringify(error),
      });
      context.res = {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          code: 401,
          message: error,
        },
      };
    } else {
      throw error;
    }
  }
};

export {
  withEgressFiltering,
};
