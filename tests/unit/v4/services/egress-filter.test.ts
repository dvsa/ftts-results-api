import { InternalAccessDeniedError } from '@dvsa/egress-filtering';
import { logger, BusinessTelemetryEvent } from '../../../../src/shared/utils/logger';
import { onInternalAccessDeniedError } from '../../../../src/v4/services/egress-filter';

jest.mock('../../../../src/shared/utils/logger');

describe('Egress filter', () => {
  describe('onInternalAccessDeniedError', () => {
    test('proper event gets logged if url is not-whitelisted', () => {
      const error: InternalAccessDeniedError = new InternalAccessDeniedError('localhost', '80', 'Unrecognised address');
      expect(() => onInternalAccessDeniedError(error)).toThrow(error);
      expect(logger.security).toHaveBeenCalledWith(expect.any(String), {
        host: error.host,
        port: error.port,
        reason: JSON.stringify(error),
      });
      expect(logger.logEvent).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_EGRESS_ERROR, error.message, {
        host: error.host,
        port: error.port,
        reason: JSON.stringify(error),
      });
    });
  });
});
