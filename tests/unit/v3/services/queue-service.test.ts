import Container from 'typedi';
import { mocked } from 'ts-jest/utils';
import QueueService from '../../../../src/v3/services/queue-service';
import { queueRecord } from '../../../mocks/result-records';
import { mockedContext } from '../../../mocks/context.mock';
import { PaymentEventError } from '../../../../src/v3/interfaces/payment-event';

jest.mock('typedi');
jest.mock('../../../../src/v3/queues/payment-events-queue', () => {});
jest.mock('../../../../src/v3/queues/arrival-queue', () => {});

const mockedTypedi = mocked(Container, true);

describe('Queue Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Arrival Queue', () => {
    test('Can send a queue record to arrival queue', async () => {
      const mockedArrivalQueue = {
        send: jest.fn(),
      };
      const data = queueRecord();
      mockedTypedi.get.mockImplementationOnce(() => mockedArrivalQueue);

      await QueueService.sendResultToArrivalQueue(mockedContext, data);

      expect(mockedArrivalQueue.send).toBeCalledWith(mockedContext, data);
    });

    test('Throws Payment event error if error occurs', async () => {
      const mockedArrivalQueue = {
        send: () => {
          throw Error('unknown error');
        },
      };

      const data = queueRecord();
      mockedTypedi.get.mockImplementationOnce(() => mockedArrivalQueue);

      await expect(() => QueueService.sendResultToArrivalQueue(mockedContext, data))
        .rejects.toThrow();
    });
  });

  describe('Payments Events Queue', () => {
    test('Can send a queue record to payments events queue', async () => {
      const mockedPaymentEventsQueue = {
        send: jest.fn(),
      };
      const data = queueRecord();
      mockedTypedi.get.mockImplementationOnce(() => mockedPaymentEventsQueue);

      await QueueService.sendResultStatusToPaymentsQueue(mockedContext, data);

      expect(mockedPaymentEventsQueue.send).toBeCalledWith(mockedContext, data);
    });

    test('Throws Payment event error if error occurs', async () => {
      const mockedPaymentEventsQueue = {
        send: () => {
          throw Error('unknown error');
        },
      };

      const data = queueRecord();
      mockedTypedi.get.mockImplementationOnce(() => mockedPaymentEventsQueue);

      await expect(() => QueueService.sendResultStatusToPaymentsQueue(mockedContext, data))
        .rejects.toThrow(PaymentEventError);
    });
  });
});
