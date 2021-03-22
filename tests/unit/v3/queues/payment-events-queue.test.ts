import { ServiceBusClient } from '@azure/service-bus';
import { QueueRecord } from '../../../../src/v3/interfaces';
import { mockedContext } from '../../../mocks/context.mock';
import PaymentEventsQueue from '../../../../src/v3/queues/payment-events-queue';
import { toPaymentEventRecord } from '../../../../src/v3/interfaces/payment-event';
import { queueRecord } from '../../../mocks/result-records';
import { mockedLogger } from '../../../mocks/logger.mock';

jest.mock('@azure/service-bus');

describe('Payment Events Queue', () => {
  let context: any;
  const paymentQueueSender = {
    send: jest.fn(),
    scheduleMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const mockServiceBusClientCreateFromConnectionString = ServiceBusClient.createFromConnectionString as jest.Mock;
    mockServiceBusClientCreateFromConnectionString.mockImplementation(() => ({
      createQueueClient: () => ({
        createSender: () => paymentQueueSender,
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

  test('can send result status records', async () => {
    const record: QueueRecord = queueRecord();
    const resultStatus = toPaymentEventRecord(record);

    const paymentsQueue = new PaymentEventsQueue();
    await paymentsQueue.send(context, record);

    expect(paymentQueueSender.send).toHaveBeenCalledWith({
      body: resultStatus,
      correlationId: undefined,
      userProperties: {
        operationId: undefined,
        parentId: 'testParentId',
      },
    });
  });
});
