import { ChainedTokenCredential } from '@dvsa/ftts-auth-client';
import { mocked } from 'ts-jest/utils';
import { acquireToken } from '../../../../../src/v4/crm/auth/dynamics-web-api';
import { mockedConfig } from '../../../../mocks/config.mock';
import { mockedLogger } from '../../../../mocks/logger.mock';

jest.mock('../../../../../src/shared/config');
jest.mock('../../../../../src/shared/utils/logger');

jest.mock('@dvsa/ftts-auth-client');
const mockedTokenCredential = mocked(ChainedTokenCredential, true);

describe('DynamicsWebApi', () => {
  describe('acquireToken', () => {
    beforeEach(() => {
      mockedConfig.azureTenantId = 'TENANT_ID';
      mockedConfig.crm.azureAdUri = 'CRM_AZURE_AD_URI';
      mockedConfig.crm.azureClientId = 'CRM_AZURE_CLIENT_ID';
      mockedConfig.crm.azureClientSecret = 'CRM_AZURE_SECRET';
      mockedConfig.crm.scope = 'TETCM_CRM_SCOPE';
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('GIVEN valid credentials WHEN called THEN returns a new token', async () => {
      mockedTokenCredential.prototype.getToken.mockResolvedValueOnce({
        token: 'mock-token-value',
        expiresOnTimestamp: 99999999,
      });

      let actualToken = 'TEST';
      const callback: (token: string) => void = (token) => {
        actualToken = token;
      };
      await acquireToken(callback);

      expect(mockedTokenCredential.prototype.getToken).toHaveBeenCalledWith(mockedConfig.crm.scope);
      expect(actualToken).toBe('mock-token-value');
    });

    test('GIVEN getToken fails WHEN called THEN returns empty string', async () => {
      const tokenError = new Error('auth error');
      mockedTokenCredential.prototype.getToken.mockRejectedValueOnce(tokenError);

      let actualToken = 'TEST';
      const callback: (token: string) => void = (token) => {
        actualToken = token;
      };
      await acquireToken(callback);

      expect(mockedTokenCredential.prototype.getToken).toHaveBeenCalledWith(mockedConfig.crm.scope);
      expect(actualToken).toBe('');
      expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        tokenError,
        'dynamicsWebApi::acquireToken: Failed to acquire token: auth error',
      );
    });
  });
});
