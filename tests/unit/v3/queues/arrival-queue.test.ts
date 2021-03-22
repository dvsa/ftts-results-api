import { ServiceBusClient } from '@azure/service-bus';
import ArrivalQueue from '../../../../src/v3/queues/arrival-queue';
import { resultRecordV3 } from '../../../mocks/result-records';
import { QueueRecord, QueueMessage } from '../../../../src/v3/interfaces';
import { mockedContext } from '../../../mocks/context.mock';
import { mockedConfig } from '../../../mocks/config.mock';
import { mockedLogger } from '../../../mocks/logger.mock';

jest.mock('@azure/service-bus');
jest.mock('../../../../src/shared/utils/logger');

describe('Arrival Queue', () => {
  let context: any;

  const arrivalQueueSender = {
    send: jest.fn(),
    scheduleMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const mockServiceBusClientCreateFromConnectionString = ServiceBusClient.createFromConnectionString as jest.Mock;
    mockServiceBusClientCreateFromConnectionString.mockImplementation(() => ({
      createQueueClient: () => ({
        createSender: () => arrivalQueueSender,
      }),
    }));

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');

    context = {
      ...mockedContext,
      traceContext: {
        traceparent: 'testParentId',
      },
    };
  });

  test('can send result records', async () => {
    const queueRecord: QueueRecord = {
      ...resultRecordV3,
      trace_id: 'testTrace',
      noOfArrivalQueueRetries: 0,
    };
    const queueMessage: QueueMessage = {
      body: queueRecord,
    };
    const arrivalQueue = new ArrivalQueue();
    await arrivalQueue.send(context, queueRecord);

    expect(arrivalQueueSender.send).toHaveBeenCalledWith({
      body: queueMessage,
      correlationId: 'testOpId',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userProperties: expect.objectContaining({
        operationId: 'testOpId',
        parentId: 'testParentId',
      }),
    });
  });

  describe('Handle failure', () => {
    test('can retry result records', async () => {
      const queueRecord: QueueRecord = {
        ...resultRecordV3,
        trace_id: 'testTrace',
        noOfArrivalQueueRetries: 0,
      };

      const arrivalQueue = new ArrivalQueue();
      arrivalQueue.scheduleMessageForRetry = jest.fn();
      await arrivalQueue.handleSendFailureRetry(context, queueRecord);

      expect(arrivalQueue.scheduleMessageForRetry).toHaveBeenCalled();
    });

    test('sends messages to DLQ after max retry count is reached', async () => {
      const queueRecord: QueueRecord = {
        ...resultRecordV3,
        trace_id: 'testTrace',
        noOfArrivalQueueRetries: mockedConfig.resultsServiceBus.arrivalQueue.maxRetryCount,
      };
      const arrivalQueue = new ArrivalQueue();

      // throwing will send message to DLQ
      await expect(() => arrivalQueue.handleSendFailureRetry(mockedContext, queueRecord))
        .rejects.toThrow();
    });
  });

  describe('Scheduling messages with delay', () => {
    test('Schedules a message with delay', async () => {
      const queueRecord: QueueRecord = {
        ...resultRecordV3,
        trace_id: 'testTrace',
        noOfArrivalQueueRetries: 0,
      };
      const expectedQueueRecord: QueueRecord = {
        ...resultRecordV3,
        trace_id: 'testTrace',
        noOfArrivalQueueRetries: 1,
      };
      const queueMessage = {
        body: expectedQueueRecord,
      };
      const arrivalQueue = new ArrivalQueue();

      await arrivalQueue.scheduleMessageForRetry(context, queueRecord);

      expect(arrivalQueueSender.scheduleMessage).toHaveBeenCalledWith(expect.objectContaining({}), {
        body: queueMessage,
        correlationId: 'testOpId',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userProperties: expect.objectContaining({
          operationId: 'testOpId',
          parentId: 'testParentId',
        }),
      });
    });
  });
});
