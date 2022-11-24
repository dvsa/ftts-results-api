/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver } from '@azure/service-bus';
import Semaphore from 'semaphore-async-await';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../../src/shared/utils/logger';
import { SARASResultQueueRecord, QueueRecordServiceBusMessage } from '../../../../src/v4/interfaces';
import { ArrivalQueue } from '../../../../src/v4/queues/arrival-queue';
import { mockedLogger } from '../../../mocks/logger.mock';
import { resultRecordV3, serviceBusMessage } from '../../../mocks/result-records';

jest.mock('@azure/service-bus');
jest.mock('../../../../src/shared/utils/logger');
jest.mock('../../../../src/shared/config');

describe('Arrival Queue', () => {
  const arrivalQueueSender = mock<ServiceBusSender>();
  const arrivalQueueReceiver = mock<ServiceBusReceiver>();
  const semaphoreMock = mock<Semaphore>();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedConstructor = mocked(ServiceBusClient);
    const serviceBusClientMock = mock<ServiceBusClient>();
    mockedConstructor.mockReturnValue(serviceBusClientMock);
    serviceBusClientMock.createSender.mockReturnValue(arrivalQueueSender);

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');
  });

  test('can send result records', async () => {
    const queueRecord: SARASResultQueueRecord = {
      ...resultRecordV3,
      trace_id: 'testTrace',
      noOfArrivalQueueRetries: 0,
    };
    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await arrivalQueue.sendMessage(queueRecord);

    expect(arrivalQueueSender.sendMessages).toHaveBeenCalledWith({
      body: queueRecord,
      contentType: 'application/json',
      applicationProperties: expect.objectContaining({}),
    });
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::sendMessage',
      'Send Result to arrival queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if sending result records fails, then log failed dependency and throw error', async () => {
    const queueRecord: SARASResultQueueRecord = {
      ...resultRecordV3,
      trace_id: 'testTrace',
      noOfArrivalQueueRetries: 0,
    };
    const error = new Error('err');
    arrivalQueueSender.sendMessages.mockRejectedValue(error);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await expect(() => arrivalQueue.sendMessage(queueRecord))
      .rejects
      .toThrow();

    expect(arrivalQueueSender.sendMessages).toHaveBeenCalledWith({
      body: queueRecord,
      contentType: 'application/json',
      applicationProperties: expect.objectContaining({}),
    });
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::sendMessage',
      'Send Result to arrival queue',
      expect.objectContaining({ success: false }),
    );
  });

  test('can retrieve result records', async () => {
    const data = [serviceBusMessage() as QueueRecordServiceBusMessage];
    arrivalQueueReceiver.receiveMessages.mockResolvedValue(data);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    const result = await arrivalQueue.receiveMessages(3);

    expect(result).toStrictEqual(data);
    expect(arrivalQueueReceiver.receiveMessages).toHaveBeenCalledWith(3);
    expect(semaphoreMock.acquire).toHaveBeenCalled();
    expect(semaphoreMock.release).toHaveBeenCalled();
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::receiveMessages',
      'Receive results from arrival queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if retrieving result records fails, then log failed dependency and throw error', async () => {
    const error = new Error('err');
    arrivalQueueReceiver.receiveMessages.mockRejectedValue(error);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await expect(() => arrivalQueue.receiveMessages(3))
      .rejects
      .toThrow();

    expect(arrivalQueueReceiver.receiveMessages).toHaveBeenCalledWith(3);
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::receiveMessages',
      'Receive results from arrival queue',
      expect.objectContaining({ success: false }),
    );
  });

  test('can complete result records', async () => {
    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await arrivalQueue.completeMessage(serviceBusMessage() as QueueRecordServiceBusMessage);

    expect(arrivalQueueReceiver.completeMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: {
        sentToCrmAt: undefined,
      },
    });

    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::completeMessage',
      'Complete result in arrival queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if completing result records fails, log a failed dependency and throw the error', async () => {
    const error = new Error('err');
    arrivalQueueReceiver.completeMessage.mockRejectedValue(error);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await expect(() => arrivalQueue.completeMessage(serviceBusMessage() as QueueRecordServiceBusMessage))
      .rejects
      .toThrow();

    expect(arrivalQueueReceiver.completeMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: {
        sentToCrmAt: undefined,
      },
    });
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::completeMessage',
      'Complete result in arrival queue',
      expect.objectContaining({ success: false }),
    );
  });

  test('can abandon result records', async () => {
    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await arrivalQueue.abandonMessage(serviceBusMessage() as QueueRecordServiceBusMessage);

    expect(arrivalQueueReceiver.abandonMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: expect.objectContaining({}),
    }, undefined);
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::abandonMessage',
      'Abandon result in arrival queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if fails to abandon result records, log failed dependency and throw the error', async () => {
    const error = new Error('err');
    arrivalQueueReceiver.abandonMessage.mockRejectedValue(error);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await expect(() => arrivalQueue.abandonMessage(serviceBusMessage() as QueueRecordServiceBusMessage))
      .rejects
      .toThrow();

    expect(arrivalQueueReceiver.abandonMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: expect.objectContaining({}),
    }, undefined);
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::abandonMessage',
      'Abandon result in arrival queue',
      expect.objectContaining({ success: false }),
    );
  });

  test('can send result record to dead letter queue', async () => {
    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await arrivalQueue.deadLetterMessage(serviceBusMessage() as QueueRecordServiceBusMessage);

    expect(arrivalQueueReceiver.deadLetterMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: expect.objectContaining({}),
    }, undefined);
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::deadLetterMessage',
      'Dead letter the result in arrival queue',
      expect.objectContaining({ success: true }),
    );
  });

  test('if sending result record to dead letter queue fails, log a dependency and throw the error', async () => {
    const error = new Error('err');
    arrivalQueueReceiver.deadLetterMessage.mockRejectedValue(error);

    const arrivalQueue = new ArrivalQueue(arrivalQueueSender, arrivalQueueReceiver, semaphoreMock);
    await expect(() => arrivalQueue.deadLetterMessage(serviceBusMessage() as QueueRecordServiceBusMessage))
      .rejects
      .toThrow();

    expect(arrivalQueueReceiver.deadLetterMessage).toHaveBeenCalledWith({
      body: serviceBusMessage().body,
      applicationProperties: expect.objectContaining({}),
    }, undefined);
    expect(logger.dependency).toHaveBeenCalledWith(
      'ArrivalQueue::deadLetterMessage',
      'Dead letter the result in arrival queue',
      expect.objectContaining({ success: false }),
    );
  });
});
