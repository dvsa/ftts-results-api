/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { httpTriggerContextWrapper } from '@dvsa/azure-logger';
import { withEgressFiltering } from '@dvsa/egress-filtering';
import { respondInternalError, SARASResultBody } from '../../shared/interfaces';
import { logger } from '../../shared/utils/logger';
import ResultReceiverController from '../../v4/resultsReceiver/controllers/result-receiver-controller';
import SARASResultBodySchema from '../../v4/schemas/SARASResultBodyV4.schema.json';
import { ALLOWED_ADDRESSES, onInternalAccessDeniedError } from '../../v4/services/egress-filter';

export const mapToV4Record = (record: SARASResultBody): void => {
  delete record.TestInformation?.CertificateExpiryDate;
};

export const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const resultController = new ResultReceiverController();
    const response = await resultController.receiveResult(context, SARASResultBodySchema, mapToV4Record);

    context.res = {
      ...context.res,
      body: response,
    };
  } catch (error) {
    logger.error(error as Error, `ResultsReceiverV3::index: ${(error as Error)?.message}`);
    const defaultResponse = respondInternalError();
    let status = defaultResponse.code;
    let body = defaultResponse;

    if (error.code) {
      status = error.code;
      body = error;
    }

    context.res = {
      ...context.res,
      status,
      body,
    };
  }
};

export const index = async (context: Context, httpRequest: HttpRequest): Promise<void> => httpTriggerContextWrapper(
  withEgressFiltering(httpTrigger, ALLOWED_ADDRESSES, onInternalAccessDeniedError, logger),
  context,
  httpRequest,
);
