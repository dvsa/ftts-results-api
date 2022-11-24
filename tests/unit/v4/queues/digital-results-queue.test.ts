import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../../src/shared/utils/logger';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { toDigitalResults } from '../../../../src/v4/interfaces/digital-results';
import { DigitalResultsQueue } from '../../../../src/v4/queues/digital-results-queue';
import { mockedLogger } from '../../../mocks/logger.mock';
import { queueRecord } from '../../../mocks/result-records';
import { mockBookingProduct } from '../../../mocks/crm-records';

jest.mock('@azure/service-bus');

describe('Digital Results Queue', () => {
  const digitalResultsSender = mock<ServiceBusSender>();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedConstructor = mocked(ServiceBusClient);
    const serviceBusClientMock = mock<ServiceBusClient>();
    mockedConstructor.mockReturnValue(serviceBusClientMock);
    serviceBusClientMock.createSender.mockReturnValue(digitalResultsSender);

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');
  });

  test('should send digital results', async () => {
    const record: SARASResultQueueRecord = queueRecord();
    const bookingProduct = mockBookingProduct();
    const digitalResultsQueue = new DigitalResultsQueue(digitalResultsSender);
    await digitalResultsQueue.sendMessages(record, bookingProduct);
    const digitalResults = toDigitalResults(record, bookingProduct);

    expect(digitalResultsSender.sendMessages).toHaveBeenCalledWith({
      body: digitalResults,
      correlationId: digitalResults.tracing.trace_id,
      applicationProperties: {
        operationId: digitalResults.tracing.trace_id,
        parentId: digitalResults.tracing.trace_id,
      },
    });

    expect(logger.dependency).toHaveBeenCalledWith(
      'DigitalResultsQueue::send',
      'Send Results to digital results queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('should log a failed dependency and throw an error when it fails to send digital results', async () => {
    const error = new Error('err');
    digitalResultsSender.sendMessages.mockRejectedValue(error);

    const record: SARASResultQueueRecord = queueRecord();
    const bookingProduct = mockBookingProduct();

    const digitalResultsQueue = new DigitalResultsQueue(digitalResultsSender);
    await expect(() => digitalResultsQueue.sendMessages(record, bookingProduct)).rejects.toThrow();

    const digitalResults = toDigitalResults(record, bookingProduct);
    expect(digitalResultsSender.sendMessages).toHaveBeenCalledWith({
      body: digitalResults,
      correlationId: digitalResults.tracing.trace_id,
      applicationProperties: {
        operationId: digitalResults.tracing.trace_id,
        parentId: digitalResults.tracing.trace_id,
      },
    });

    expect(logger.dependency).toHaveBeenCalledWith(
      'DigitalResultsQueue::send',
      'Send Results to digital results queue',
      expect.objectContaining({ success: false }),
    );
  });

});
