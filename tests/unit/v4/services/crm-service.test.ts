import { mocked } from 'ts-jest/utils';
import { queueRecord } from '../../../mocks/result-records';
import { CrmError } from '../../../../src/v4/crm/crm-error';
import CrmService from '../../../../src/v4/services/crm-service';
import { CrmClient, newCrmClient } from '../../../../src/v4/crm/crm-client';

jest.mock('../../../../src/v4/crm/crm-client');

const mockedCrmClient = mocked(CrmClient, true);
const mockedNewCrmClient = mocked(newCrmClient, true);
const testHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';

describe('Crm Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Can send a queue record to CRM', async () => {
    const data = queueRecord();
    const customCrmClient: Partial<CrmClient> = {
      postTestResult: jest.fn(),
    };
    mockedNewCrmClient.mockImplementation(() => customCrmClient as CrmClient);

    await CrmService.sendResultToCrm(data, testHistoryId);

    expect(customCrmClient.postTestResult).toHaveBeenCalledWith(data, testHistoryId);
  });

  test('Throws Crm event error if error occurs', async () => {
    mockedCrmClient.prototype.postTestResult.mockImplementationOnce(() => {
      throw Error('Crm errors');
    });

    await expect(() => CrmService.sendResultToCrm(queueRecord(), testHistoryId))
      .rejects.toThrow(CrmError);
  });
});
