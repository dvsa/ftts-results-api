import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../../src/shared/utils/logger';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { toPaymentEventRecord } from '../../../../src/v4/interfaces/payment-event';
import { PaymentEventsQueue } from '../../../../src/v4/queues/payment-events-queue';
import { mockedLogger } from '../../../mocks/logger.mock';
import { queueRecord } from '../../../mocks/result-records';

jest.mock('@azure/service-bus');

describe('Payment Events Queue', () => {
  const paymentQueueSender = mock<ServiceBusSender>();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedConstructor = mocked(ServiceBusClient);
    const serviceBusClientMock = mock<ServiceBusClient>();
    mockedConstructor.mockReturnValue(serviceBusClientMock);
    serviceBusClientMock.createSender.mockReturnValue(paymentQueueSender);

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');
  });

  test('can send result status records', async () => {
    const record: SARASResultQueueRecord = queueRecord();
    const resultStatus = toPaymentEventRecord(record);

    const paymentsQueue = new PaymentEventsQueue(paymentQueueSender);
    await paymentsQueue.sendMessages(record);

    expect(paymentQueueSender.sendMessages).toHaveBeenCalledWith({
      body: resultStatus,
    });
    expect(logger.dependency).toHaveBeenCalledWith(
      'PaymentsEventsQueue::send',
      'Send Result Status to payments events queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if fails to send result status records, log a failed dependency and throw the error', async () => {
    const error = new Error('err');
    paymentQueueSender.sendMessages.mockRejectedValue(error);

    const record: SARASResultQueueRecord = queueRecord();
    const resultStatus = toPaymentEventRecord(record);

    const paymentsQueue = new PaymentEventsQueue(paymentQueueSender);
    await expect(() => paymentsQueue.sendMessages(record))
      .rejects
      .toThrow();

    expect(paymentQueueSender.sendMessages).toHaveBeenCalledWith({
      body: resultStatus,
    });
    expect(logger.dependency).toHaveBeenCalledWith(
      'PaymentsEventsQueue::send',
      'Send Result Status to payments events queue',
      expect.objectContaining({ success: false }),
    );
  });
});
