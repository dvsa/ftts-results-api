import {
  ChainedTokenCredential, ClientSecretCredential, ManagedIdentityCredential, TokenCredential,
} from '@dvsa/ftts-auth-client';
import DynamicsWebApi, { OnTokenAcquiredCallback } from 'dynamics-web-api';
import config from '../../../shared/config';
import { logger } from '../../../shared/utils/logger';

/**
 * Chained credential using Managed Identity in the first instance
 * and falling back to Client Secret method for local dev/test.
 * https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/identity/identity/samples/AzureIdentityExamples.md#chaining-credentials
 */
const getChainedTokenCredential = (): ChainedTokenCredential => {
  const sources: TokenCredential[] = [new ManagedIdentityCredential(config.userAssignedClientId)];
  if (config.azureTenantId && config.crm.azureClientId && config.crm.azureClientSecret) {
    sources.push(new ClientSecretCredential(config.azureTenantId, config.crm.azureClientId, config.crm.azureClientSecret));
  }
  return new ChainedTokenCredential(...sources);
};

const chainedTokenCredential = getChainedTokenCredential();
logger.debug('dynamicsWebApi: Token credential configured');

export const acquireToken = async (dynamicsWebApiCallback: OnTokenAcquiredCallback): Promise<void> => {
  let accessToken;
  try {
    accessToken = await chainedTokenCredential.getToken(config.crm.scope);
  } catch (e) {
    logger.error(e as Error, `dynamicsWebApi::acquireToken: Failed to acquire token: ${(e as Error).message}`);
  }
  logger.debug('dynamicsWebApi::acquireToken: Token acquired', {
    userAssignedClientId: config.userAssignedClientId,
    isEmpty: accessToken == null,
  });
  dynamicsWebApiCallback(accessToken ? accessToken.token : '');
};

export const newDynamicsWebApi = (): DynamicsWebApi => new DynamicsWebApi({
  webApiUrl: `${config.crm.resourceUrl}/api/data/v9.1/`,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onTokenRefresh: acquireToken,
});
export default newDynamicsWebApi();
