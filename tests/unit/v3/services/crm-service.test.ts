import { mocked } from 'ts-jest/utils';
import { queueRecord } from '../../../mocks/result-records';
import { mockedContext } from '../../../mocks/context.mock';
import CrmError from '../../../../src/v3/crm/crm-error';
import CrmService from '../../../../src/v3/services/crm-service';
import { QueueMessage } from '../../../../src/v3/interfaces';
import { CrmClient, newCrmClient } from '../../../../src/v3/crm/crm-client';
import { logger } from '../../../../src/shared/utils/logger';

jest.mock('../../../../src/v3/crm/crm-client');

const mockedCrmClient = mocked(CrmClient, true);
const mockedNewCrmClient = mocked(newCrmClient, true);

describe('Crm Service', () => {
  beforeEach(() => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => new Date('2021-07-21T11:01:58.135Z').valueOf());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Can send a queue record to CRM', async () => {
    const data = queueRecord();
    const customCrmClient: Partial<CrmClient> = {
      postTestResult: jest.fn(),
    };
    mockedNewCrmClient.mockImplementation(() => customCrmClient as CrmClient);

    await CrmService.sendResultToCrm(mockedContext, data);

    expect(customCrmClient.postTestResult).toBeCalledWith(data);
    expect(data.sentToCrmAt).toEqual('2021-07-21T11:01:58.135Z');
  });

  test('Throws Crm event error if error occurs', async () => {
    const queueMessage: QueueMessage = { body: queueRecord() };
    mockedCrmClient.prototype.postTestResult.mockImplementationOnce(() => {
      throw Error('Crm errors');
    });

    await expect(() => CrmService.sendResultToCrm(mockedContext, queueMessage.body))
      .rejects.toThrow(CrmError);
  });

  test('Does not resend to crm if already sent', async () => {
    const queueMessage: QueueMessage = { body: queueRecord() };
    queueMessage.body.sentToCrmAt = Date.now().toString();
    const customCrmClient: Partial<CrmClient> = {
      postTestResult: jest.fn(),
    };
    mockedNewCrmClient.mockImplementation(() => customCrmClient as CrmClient);

    await CrmService.sendResultToCrm(mockedContext, queueMessage.body);

    expect(customCrmClient.postTestResult).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Skipping attempt to add Result to CRM - Result already added'),
      { context: mockedContext },
    );
  });
});
