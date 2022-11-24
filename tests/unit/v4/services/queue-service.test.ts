import { TestResultsError } from './../../../../src/v4/interfaces/test-results';
import { mocked } from 'ts-jest/utils';
import QueueService from '../../../../src/v4/services/queue-service';
import { queueRecord, serviceBusMessage } from '../../../mocks/result-records';
import { mockBookingProduct } from '../../../mocks/crm-records';
import { PaymentEventError } from '../../../../src/v4/interfaces/payment-event';
import { ArrivalQueue } from '../../../../src/v4/queues/arrival-queue';
import { PaymentEventsQueue } from '../../../../src/v4/queues/payment-events-queue';
import { DigitalResultsQueue } from '../../../../src/v4/queues/digital-results-queue';
import { DigitalResultsError, QueueRecordServiceBusMessage } from '../../../../src/v4/interfaces';
import { BusinessTelemetryEvent, logger } from '../../../../src/shared/utils/logger';
import { TestResultsPersisterQueue } from '../../../../src/v4/queues/test-results-persister-queue';

jest.mock('@azure/service-bus');
const mockedPaymentQueue = mocked(PaymentEventsQueue, true);
const mockedDigitalResultsQueue = mocked(DigitalResultsQueue, true);
const mockedTestResultsQueue = mocked(TestResultsPersisterQueue, true);
const testHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';
jest.mock('../../../../src/v4/queues/payment-events-queue');
jest.mock('../../../../src/v4/queues/digital-results-queue');
jest.mock('../../../../src/v4/queues/test-results-persister-queue');

const mockedArrivalQueue = mocked(ArrivalQueue, true);
jest.mock('../../../../src/v4/queues/arrival-queue');

describe('Queue Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Arrival Queue', () => {
    test('Can send a queue record to arrival queue', async () => {
      const data = queueRecord();
      mockedArrivalQueue.prototype.sendMessage.mockImplementation(jest.fn());

      await QueueService.sendResultToArrivalQueue(data);

      expect(mockedArrivalQueue.prototype.sendMessage).toHaveBeenCalledWith(data);
    });

    test('Throws Payment event error if error occurs', async () => {
      const error = new Error('unknown error');
      mockedArrivalQueue.prototype.sendMessage.mockRejectedValue(error);
      const data = queueRecord();

      await expect(() => QueueService.sendResultToArrivalQueue(data))
        .rejects.toThrow(error);
    });

    test('Retrieve messages from arrival queue', async () => {
      const data = [serviceBusMessage()];
      mockedArrivalQueue.prototype.receiveMessages.mockImplementation(() => Promise.resolve(data as any));

      const result = await QueueService.retrieveResultsFromArrivalQueue();

      expect(mockedArrivalQueue.prototype.receiveMessages).toHaveBeenCalled();
      expect(result).toStrictEqual(data);
    });

    test('Log event if retrieving messages from arrival queue fails', async () => {
      mockedArrivalQueue.prototype.receiveMessages.mockImplementation(() => {
        throw new Error('err');
      });

      await expect(() => QueueService.retrieveResultsFromArrivalQueue())
        .rejects.toThrow();

      expect(mockedArrivalQueue.prototype.receiveMessages).toHaveBeenCalled();
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvent.RES_CONSUMER_QUEUE_RETRIEVE_ERROR,
        'failed to retrieve results from arrival queue',
      );
    });

    test('Complete message', async () => {
      mockedArrivalQueue.prototype.completeMessage.mockImplementation(() => Promise.resolve());

      await QueueService.completeResult(serviceBusMessage() as QueueRecordServiceBusMessage);

      expect(mockedArrivalQueue.prototype.completeMessage).toHaveBeenCalled();
    });

    test('throw error if fails to complete result', async () => {
      mockedArrivalQueue.prototype.completeMessage.mockImplementation(() => { throw new Error('err'); });

      await expect(() => QueueService.completeResult(serviceBusMessage() as QueueRecordServiceBusMessage))
        .rejects.toThrow();

      expect(mockedArrivalQueue.prototype.completeMessage).toHaveBeenCalled();
    });

    test('Abandon message', async () => {
      mockedArrivalQueue.prototype.abandonMessage.mockImplementation(() => Promise.resolve());

      await QueueService.abandonResult(serviceBusMessage() as QueueRecordServiceBusMessage);

      expect(mockedArrivalQueue.prototype.abandonMessage).toHaveBeenCalled();
    });

    test('throw error if fails to abandon result', async () => {
      mockedArrivalQueue.prototype.abandonMessage.mockImplementation(() => { throw new Error('err'); });

      await expect(() => QueueService.abandonResult(serviceBusMessage() as QueueRecordServiceBusMessage))
        .rejects.toThrow();

      expect(mockedArrivalQueue.prototype.abandonMessage).toHaveBeenCalled();
    });

    test('Dead letter message', async () => {
      mockedArrivalQueue.prototype.deadLetterMessage.mockImplementation(() => Promise.resolve());

      await QueueService.deadLetterResult(serviceBusMessage() as QueueRecordServiceBusMessage);

      expect(mockedArrivalQueue.prototype.deadLetterMessage).toHaveBeenCalled();
    });

    test('throw error if fails to dead letter result', async () => {
      mockedArrivalQueue.prototype.deadLetterMessage.mockImplementation(() => { throw new Error('err'); });

      await expect(() => QueueService.deadLetterResult(serviceBusMessage() as QueueRecordServiceBusMessage))
        .rejects.toThrow();

      expect(mockedArrivalQueue.prototype.deadLetterMessage).toHaveBeenCalled();
    });
  });

  describe('Payments Events Queue', () => {
    test('Can send a queue record to payments events queue', async () => {
      const data = queueRecord();
      mockedPaymentQueue.prototype.sendMessages.mockImplementation(jest.fn());

      await QueueService.sendResultStatusToPaymentsQueue(data);

      expect(mockedPaymentQueue.prototype.sendMessages).toHaveBeenCalledWith(data);
    });

    test('Throws Payment event error if error occurs', async () => {
      const error = new PaymentEventError('unknown error');
      const data = queueRecord();
      mockedPaymentQueue.prototype.sendMessages.mockRejectedValueOnce(error);

      await expect(() => QueueService.sendResultStatusToPaymentsQueue(data))
        .rejects.toThrow(PaymentEventError);
    });
  });

  describe('Digital Results Queue', () => {
    test('should send digital results to digital results queue', async () => {
      const data = queueRecord();
      const bookingProduct = mockBookingProduct();
      mockedDigitalResultsQueue.prototype.sendMessages.mockImplementation(jest.fn());

      await QueueService.sendResultToDigitalResultsQueue(data, bookingProduct);

      expect(mockedDigitalResultsQueue.prototype.sendMessages).toHaveBeenCalledWith(data, bookingProduct);
    });

    test('should throw error when an error occurs', async () => {
      const data = queueRecord();
      const bookingProduct = mockBookingProduct();
      const error = new DigitalResultsError('unknown error');
      mockedDigitalResultsQueue.prototype.sendMessages.mockRejectedValueOnce(error);
      await expect(() => QueueService.sendResultToDigitalResultsQueue(data, bookingProduct)).rejects.toThrow(DigitalResultsError);
    });
  });

  describe('Test Result Persister Queue', () => {
    test('should send test results to test results persister queue', async () => {
      const data = queueRecord();
      mockedTestResultsQueue.prototype.sendMessages.mockImplementation(jest.fn());

      await QueueService.sendTestResultsToPersister(data, testHistoryId);

      expect(mockedTestResultsQueue.prototype.sendMessages).toHaveBeenCalledWith(data, testHistoryId);
    });

    test('should throw error when an error occurs', async () => {
      const data = queueRecord();
      const error = new TestResultsError('unknown error');
      mockedTestResultsQueue.prototype.sendMessages.mockRejectedValueOnce(error);
      await expect(() => QueueService.sendTestResultsToPersister(data, testHistoryId)).rejects.toThrow(error);
    });
  });

});
