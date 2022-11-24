import Queue from 'queue-promise';
import MockDate from 'mockdate';
import { mocked } from 'ts-jest/utils';
import { processMessages, endOfQueueReached, addResultsToQueue, logEventDependingOnResults } from '../../../../../src/v4/resultSender/controllers/result-sender-timer-controller';
import { queueRecord } from '../../../../mocks/result-records';
import QueueService from '../../../../../src/v4/services/queue-service';
import config from '../../../../../src/shared/config';
import { BusinessTelemetryEvent, logger } from '../../../../../src/shared/utils/logger';
import { executionTimeoutNearlyReached } from  '../../../../../src/v4/utils/time';


jest.mock('queue-promise');
jest.mock('@azure/service-bus');
jest.mock('../../../../../src/v4/services/crm-service');
jest.mock('../../../../../src/v4/services/queue-service');
jest.mock('../../../../../src/v4/queues/arrival-queue');
jest.mock('../../../../../src/v4/queues/payment-events-queue');
jest.mock('../../../../../src/shared/utils/logger');
jest.mock('../../../../../src/shared/config');
jest.mock('../../../../../src/v4/utils/time');

const mockExecutionTimeoutNearlyReached = mocked(executionTimeoutNearlyReached, true);
const mockedConfig = mocked(config, true);
const mockedQueueService = mocked(QueueService, true);
const mockedQueue = mocked(Queue, true);

describe('Result Sender Timer Controller', () => {
  let resultQueue: Queue;
  beforeEach(() => {
    MockDate.set('2021-08-27T09:04:28');
    mockedConfig.concurrency.parallelProcessCount = 5;
    mockedConfig.concurrency.processInterval = 5;
    mockedConfig.resultsServiceBus.arrivalQueue.maxRetrieveCount = 9;
    resultQueue = new Queue({
      concurrent: mockedConfig.concurrency.parallelProcessCount,
      interval: mockedConfig.concurrency.processInterval,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
    resultQueue.clear();
  });

  describe('process', () => {
    test('Successfully retrieves messages and adds them to the internal queue', async () => {
      const record = queueRecord();
      const serviceBusMessage = {
        body: record,
        complete: jest.fn(),
      };
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([serviceBusMessage as any]);

      await processMessages();

      expect(mockedQueueService.retrieveResultsFromArrivalQueue).toHaveBeenCalled();
      expect(mockedQueue.prototype.add).toHaveBeenCalled();
    });

    test('No messages available to add to queue', async () => {
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([]);

      await processMessages();

      expect(mockedQueueService.retrieveResultsFromArrivalQueue).toHaveBeenCalled();
      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_NO_RESULTS, 'No results to consume in arrival queue');
    });
  });

  describe('endOfQueueReached', () => {

    test('no error jounrey', async () => {
      const record = queueRecord();
      const serviceBusMessage = {
        body: record,
        complete: jest.fn(),
      };
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([serviceBusMessage as any]);

      const executionStartDateTime = new Date();
      const initialResultCount = 5;
      const numberOfResultsProcessed = 1;

      mockExecutionTimeoutNearlyReached.mockReturnValue(false);

      await endOfQueueReached(initialResultCount, executionStartDateTime, numberOfResultsProcessed, resultQueue);

      expect(executionTimeoutNearlyReached).toHaveBeenCalledWith(executionStartDateTime, mockedConfig.functionTimeout, mockedConfig.functionTimeoutBuffer);
    });

    test('too many messages and therefore returns error', async () => {
      const record = queueRecord();
      const serviceBusMessage = {
        body: record,
        complete: jest.fn(),
      };
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([serviceBusMessage as any]);

      const executionStartDateTime = new Date();
      const initialResultCount = 5;
      const numberOfResultsProcessed = 10;
      mockExecutionTimeoutNearlyReached.mockReturnValue(false);

      await endOfQueueReached(initialResultCount, executionStartDateTime, numberOfResultsProcessed, resultQueue);

      expect(executionTimeoutNearlyReached).toHaveBeenCalledWith(executionStartDateTime, mockedConfig.functionTimeout, mockedConfig.functionTimeoutBuffer);
      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_PROCESSED_MAX_RESULTS, 'reached max results', { numberOfResultsProcessed, maxResultsToProcess: config.resultsServiceBus.arrivalQueue.maxRetrieveCount });
    });

    test('executionTimeoutNearlyReached set to true', async () => {
      const executionStartDateTime = new Date();
      const initialResultCount = 5;
      const numberOfResultsProcessed = 1;
      mockExecutionTimeoutNearlyReached.mockReturnValue(true);

      await endOfQueueReached(initialResultCount, executionStartDateTime, numberOfResultsProcessed, resultQueue);

      expect(executionTimeoutNearlyReached).toHaveBeenCalledWith(executionStartDateTime, mockedConfig.functionTimeout, mockedConfig.functionTimeoutBuffer);
      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_TIMEOUT_REACHED, 'Reached function timeout', { now: Date.now() });
    });
  });
  describe('addResultsToQueue', () => {

    test('log if there are no messages received from the arrival queue', async () => {
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([]);

      const returnedValue = await addResultsToQueue(resultQueue);

      expect(mockedQueueService.retrieveResultsFromArrivalQueue).toHaveBeenCalled();
      expect(returnedValue).toBe(0);
    });
    test('Add message(1) to the Queue', async () => {
      const record = queueRecord();
      const serviceBusMessage = {
        body: record,
        complete: jest.fn(),
      };
      mockedQueueService.retrieveResultsFromArrivalQueue.mockResolvedValue([serviceBusMessage as any]);
      const numberOfResults = 0;


      const returnedValue = await addResultsToQueue(resultQueue, numberOfResults);

      expect(mockedQueueService.retrieveResultsFromArrivalQueue).toHaveBeenCalled();
      expect(returnedValue).toBe(1);
      expect(mockedQueue.prototype.add).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('ResultSenderTimerController::addResultsToQueue: Processing 1 result');
    });
  });
  describe('logEventDependingOnResults', () => {
    test('num of results is equal to 0', () => {
      const numOfResultsAdded = 0;
      const numberOfResultsProcessed = 9;

      logEventDependingOnResults(numOfResultsAdded, numberOfResultsProcessed);

      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_PROCESSED_ALL_RESULTS, 'consumed all results in arrival queue', {
        numberOfResultsProcessed,
      });
    });

    test('num of results is greater than 0', () => {
      const numOfResultsAdded = 5;
      const numberOfResultsProcessed = 9;

      logEventDependingOnResults(numOfResultsAdded, numberOfResultsProcessed);

      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_PROCESS_ADDITIONAL_RESULTS, 'Added more items to the internal queue for processing', {
        numberOfResultsProcessed,
        numOfResultsAdded,
        maxResultsLimit: config.resultsServiceBus.arrivalQueue.maxRetrieveCount,
      });
    });
  });
});
