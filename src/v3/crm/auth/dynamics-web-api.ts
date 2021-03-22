import DynamicsWebApi from 'dynamics-web-api';
import authClient from '@dvsa/ftts-auth-client';

import config from '../../../shared/config';
import { logger } from '../../../shared/utils/logger';

export async function onTokenRefresh(
  dynamicsWebApiCallback: (token: string) => void,
): Promise<void> {
  try {
    const accessToken = await authClient.getToken({
      url: config.crm.azureAdUri,
      clientId: config.crm.azureClientId,
      clientSecret: config.crm.azureClientSecret,
      resource: config.crm.resourceUrl,
    });
    dynamicsWebApiCallback(accessToken.value);
  } catch (error) {
    logger.error(error, `Failed to authenticate with CRM - ${(error as Error).message}`);
    // Callback needs to be called - to prevent function from hanging
    dynamicsWebApiCallback('');
  }
}

export function webApiUrl(): string {
  return `${config.crm.resourceUrl}/api/data/v9.1/`;
}

export function newDynamicsWebApi(): DynamicsWebApi {
  return new DynamicsWebApi({
    webApiUrl: webApiUrl(),
    onTokenRefresh,
  });
}
