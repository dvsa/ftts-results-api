import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { mockedLogger } from '../../../mocks/logger.mock';
import { queueRecord } from '../../../mocks/result-records';
import { TestResultsPersisterQueue } from '../../../../src/v4/queues/test-results-persister-queue';
import { toTestResults } from '../../../../src/v4/interfaces/test-results';

jest.mock('@azure/service-bus');
const testHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';

describe('Test Results Persister Queue', () => {
  const resultsSender = mock<ServiceBusSender>();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedConstructor = mocked(ServiceBusClient);
    const serviceBusClientMock = mock<ServiceBusClient>();
    mockedConstructor.mockReturnValue(serviceBusClientMock);
    serviceBusClientMock.createSender.mockReturnValue(resultsSender);
  });

  test('should send test results', async () => {
    const record: SARASResultQueueRecord = queueRecord();
    const testResultsQueue = new TestResultsPersisterQueue(resultsSender);
    await testResultsQueue.sendMessages(record, testHistoryId);
    const testResults = toTestResults(record, testHistoryId);

    expect(resultsSender.sendMessages).toHaveBeenCalledWith({
      body: testResults,
      correlationId: record.trace_id,
      applicationProperties: {
        operationId: record.trace_id,
        parentId: record.trace_id,
      },
    });

    expect(mockedLogger.dependency).toHaveBeenCalledWith(
      'TestResultsPersisterQueue::sendMessages',
      'Send Results to TR Persister queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('should log a failed dependency and throw an error when it fails to send test results', async () => {
    const error = new Error('err');
    resultsSender.sendMessages.mockRejectedValue(error);

    const record: SARASResultQueueRecord = queueRecord();

    const testResultsQueue = new TestResultsPersisterQueue(resultsSender);
    await expect(() => testResultsQueue.sendMessages(record, testHistoryId)).rejects.toThrow(error);

    expect(mockedLogger.dependency).toHaveBeenCalledWith(
      'TestResultsPersisterQueue::sendMessages',
      'Send Results to TR Persister queue',
      expect.objectContaining({ success: false }),
    );
  });

});
