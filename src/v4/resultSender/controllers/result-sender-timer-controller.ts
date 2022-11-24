import Queue from 'queue-promise';
import config from '../../../shared/config';
import { BusinessTelemetryEvent, logger } from '../../../shared/utils/logger';
import { QueueService } from '../../services';
import { ResultProcessor } from '../../services/result-processor';
import { executionTimeoutNearlyReached } from '../../utils/time';

export async function processMessages(): Promise<void> {
  const resultQueue = new Queue({
    concurrent: config.concurrency.parallelProcessCount,
    interval: config.concurrency.processInterval,
  });
  const executionStartDateTime = new Date();
  const initialResultCount = await addResultsToQueue(resultQueue);
  if (initialResultCount === 0) {
    logger.event(BusinessTelemetryEvent.RES_CONSUMER_NO_RESULTS, 'No results to consume in arrival queue');
    return;
  } else {
    resultQueue.start();
  }
  let numberOfResultsProcessed = 0;
  numberOfResultsProcessed += initialResultCount;

  resultQueue.on('start', () => {
    logger.debug(`ResultSenderTimerController::process: Queue processing started: ${Date.now()}`, { startTime: Date.now() });
  });

  resultQueue.on('end', () => {
    endOfQueueReached(initialResultCount, executionStartDateTime, numberOfResultsProcessed, resultQueue)
      .then((num: number) => {
        numberOfResultsProcessed = num;
      })
      .catch((error) => {
        logger.error(error as Error, 'processNewMessages::timerTrigger: End of queue error');
      });
  });
}

export async function addResultsToQueue(resultQueue: Queue, numberOfResults?: number): Promise<number> {
  const results = await QueueService.retrieveResultsFromArrivalQueue(numberOfResults);
  if (results?.length > 0) {
    logger.info(`ResultSenderTimerController::addResultsToQueue: Processing ${results.length} result${results.length > 1 ? 's' : ''}`);
  }
  for (const result of results) {
    resultQueue.add(() => ResultProcessor.processResult(result));
  }
  return results.length;
}

export function logEventDependingOnResults(numOfResultsAdded: number, numberOfResultsProcessed:number ) {
  if (numOfResultsAdded === 0) {
    logger.event(BusinessTelemetryEvent.RES_CONSUMER_PROCESSED_ALL_RESULTS, 'consumed all results in arrival queue', {
      numberOfResultsProcessed,
    });
  } else {
    logger.event(BusinessTelemetryEvent.RES_CONSUMER_PROCESS_ADDITIONAL_RESULTS, 'Added more items to the internal queue for processing', {
      numberOfResultsProcessed,
      numOfResultsAdded,
      maxResultsLimit: config.resultsServiceBus.arrivalQueue.maxRetrieveCount,
    });
  }
}

export async function endOfQueueReached(initialResultCount: number, executionStartDateTime: Date, numberOfResultsProcessed: number, resultQueue: Queue ): Promise<number> {
  logger.debug(`ResultSenderTimerController::process: Reached end of queue: ${Date.now()}`, {
    finishTime: Date.now(),
    numberOfResultsProcessed,
    initialResultCount,
    maxResultsLimit: config.resultsServiceBus.arrivalQueue.maxRetrieveCount,
  });
  let totalResultsProcessed = numberOfResultsProcessed;

  // retrieve more results from arrival queue and add to the internal queue
  if (!executionTimeoutNearlyReached(executionStartDateTime, config.functionTimeout, config.functionTimeoutBuffer)) {
    if (numberOfResultsProcessed < config.resultsServiceBus.arrivalQueue.maxRetrieveCount) {
      try {
        const numOfResultsAdded = await addResultsToQueue(resultQueue, config.resultsServiceBus.arrivalQueue.retrieveCount);
        logEventDependingOnResults(numOfResultsAdded, numberOfResultsProcessed);
        totalResultsProcessed += numOfResultsAdded;
      } catch (error) {
        logger.error(error as Error, 'ResultSenderTimerController::process: Unable to add more items to the queue');
      }
    } else {
      logger.event(BusinessTelemetryEvent.RES_CONSUMER_PROCESSED_MAX_RESULTS, 'reached max results', { numberOfResultsProcessed, maxResultsToProcess: config.resultsServiceBus.arrivalQueue.maxRetrieveCount });
    }
  } else {
    logger.event(BusinessTelemetryEvent.RES_CONSUMER_TIMEOUT_REACHED, 'Reached function timeout', { now: Date.now() });
  }
  return totalResultsProcessed;
}
