import authClient from '@dvsa/ftts-auth-client';
import DynamicsWebApi from 'dynamics-web-api';
import Token from '@dvsa/ftts-auth-client/dist/token';
import { mocked } from 'ts-jest/utils';
import { mockedConfig } from '../../../../mocks/config.mock';
import { onTokenRefresh, webApiUrl, newDynamicsWebApi } from '../../../../../src/v3/crm/auth/dynamics-web-api';
import { logger } from '../../../../../src/shared/utils/logger';

jest.mock('../../../../../src/shared/utils/logger');

const mockedAuthClient = mocked(authClient, true);

describe('DynamicsWebApi', () => {
  describe('webApiUrl', () => {
    test('GIVEN config.crm.azureAdUri WHEN called THEN returns a proper url', () => {
      mockedConfig.crm.resourceUrl = 'CRM_RESOURCE_URL';

      const url = webApiUrl();

      expect(url).toEqual(`${mockedConfig.crm.resourceUrl}/api/data/v9.1/`);
    });
  });

  describe('onTokenRefresh', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
      mockedConfig.crm.azureAdUri = 'CRM_AZURE_AD_URI';
      mockedConfig.crm.azureClientId = 'CRM_AZURE_CLIENT_ID';
      mockedConfig.crm.azureClientSecret = 'CRM_AZURE_CLIENT_SECRET';
      mockedConfig.crm.resourceUrl = 'CRM_RESOURCE_URL';
      console.error = originalConsoleError;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('GIVEN valid credentials WHEN called THEN returns a new token', async () => {
      const expectedToken: Token = {
        value: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs',
        expiresAt: new Date(),
        hasExpired: () => false,
      };
      mockedAuthClient.getToken = jest.fn().mockResolvedValue(expectedToken);

      let actualToken: string | undefined;

      const callback: (token: string) => void = (token) => {
        actualToken = token;
      };
      await onTokenRefresh(callback);

      expect(mockedAuthClient.getToken).toHaveBeenCalledWith({
        clientId: 'CRM_AZURE_CLIENT_ID',
        clientSecret: 'CRM_AZURE_CLIENT_SECRET',
        resource: 'CRM_RESOURCE_URL',
        url: 'CRM_AZURE_AD_URI',
      });
      expect(actualToken).toEqual(expectedToken.value);
    });

    test('GIVEN invalid credentials, callback is called with a blank string', async () => {
      mockedAuthClient.getToken = jest.fn().mockRejectedValue(new Error('invalid credentials'));
      const callback = jest.fn();

      await onTokenRefresh(callback);

      expect(callback).toHaveBeenCalledWith('');
      expect(logger.error).toHaveBeenCalledWith(Error('invalid credentials'), 'Failed to authenticate with CRM - invalid credentials');
    });
  });

  describe('newDynamicsWebApi', () => {
    test('should return a new DynamicsWebApi', () => {
      const result = newDynamicsWebApi();
      expect(result instanceof DynamicsWebApi);
    });
  });
});
