import { addressParser, InternalAccessDeniedError } from '@dvsa/egress-filtering';
import config from '../../shared/config';
import { BusinessTelemetryEvent, logger } from '../../shared/utils/logger';

const ALLOWED_ADDRESSES = [
  addressParser.parseUri(config.crm.resourceUrl),
  addressParser.parseSbConnectionString(config.testResultPersisterServiceBus.connectionString),
  addressParser.parseSbConnectionString(config.resultsServiceBus.connectionString),
  addressParser.parseSbConnectionString(config.paymentsServiceBus.connectionString),
  addressParser.parseSbConnectionString(config.digitalResultsServiceBus.connectionString),
  ...addressParser.parseConnectionString(config.storage.connectionString),
];

const onInternalAccessDeniedError = (error: InternalAccessDeniedError): void => {
  logger.security('egress-filter::OnInternalAccessDeniedError: url is not whitelisted so it cannot be called', {
    host: error.host,
    port: error.port,
    reason: JSON.stringify(error),
  });

  logger.logEvent(BusinessTelemetryEvent.RES_EGRESS_ERROR, error.message, {
    host: error.host,
    port: error.port,
    reason: JSON.stringify(error),
  });

  throw error;
};

export { ALLOWED_ADDRESSES, onInternalAccessDeniedError };
