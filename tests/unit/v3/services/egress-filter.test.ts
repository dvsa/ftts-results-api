import { AzureFunction, Context } from '@azure/functions';
import { InternalAccessDeniedError } from '@dvsa/egress-filtering';
import Axios from 'axios';

import { withEgressFiltering } from '../../../../src/v3/services/egress-filter';
import { logger } from '../../../../src/shared/utils/logger';

jest.mock('../../../../src/shared/utils/logger');

describe('Egress filter service', () => {
  const ctx: Partial<Context> = { invocationId: '33' };
  const func = () => Axios.get('https://here-be-dragons.org');

  test('filter stops unauthorised request attempt', async () => {
    const toCall = withEgressFiltering(func as unknown as AzureFunction);
    const message = new InternalAccessDeniedError('host', 'port', 'Unrecognised address');
    await toCall(ctx as Context);

    expect(logger.error).toHaveBeenCalled();
    expect(ctx.res).toEqual({
      ...ctx.res,
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        code: 401,
        message,
      },
    });
  });

  test('filter throws errors if not InternalAccessDeniedError', async () => {
    const error = new Error('general error');
    const erroredFunc = () => {
      throw error;
    };
    const toCall = withEgressFiltering(erroredFunc as unknown as AzureFunction);

    await expect(toCall(ctx as Context)).rejects.toThrow(error);
  });
});
