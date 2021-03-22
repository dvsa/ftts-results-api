/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AzureFunction, Context } from '@azure/functions';

import ResultReceiverController from './controllers/result-receiver-controller';
import SARASResultBodySchema from '../schemas/SARASResultBodyV3.schema.json';
import { logger } from '../../shared/utils/logger';
import { withEgressFiltering } from '../services/egress-filter';
import { respondInternalError } from '../../shared/interfaces';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const resultController = new ResultReceiverController();
    const response = await resultController.receiveResult(context, SARASResultBodySchema);

    context.res = {
      ...context.res,
      body: response,
    };
  } catch (error) {
    logger.error(error);
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

export default withEgressFiltering(httpTrigger);
