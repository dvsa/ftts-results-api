import {
  ServiceBusClient, ServiceBusSender,
} from '@azure/service-bus';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import config from '../../shared/config';
import { getIdentifiers } from '../../shared/utils/identifiers';
import { logger } from '../../shared/utils/logger';
import { SARASResultQueueRecord } from '../interfaces';
import { TestResults, toTestResults } from '../interfaces/test-results';

export class TestResultsPersisterQueue {
  constructor(private sender: ServiceBusSender) { }

  public async sendMessages(record: SARASResultQueueRecord, testHistoryContentId: string): Promise<void> {
    const sendStartDate = Date.now();

    try {
      const testResults: TestResults = toTestResults(record, testHistoryContentId);

      logger.debug('TestResultsPersisterQueue::sendMessages: Sending Results to TR Persister queue', {
        ...getIdentifiers(record),
      });

      await this.sender.sendMessages({
        body: testResults,
        correlationId: record.trace_id,
        applicationProperties: {
          operationId: record.trace_id,
          parentId: record.trace_id,
        },
      });

      this.logDependency(record, testHistoryContentId, { duration: Date.now() - sendStartDate, resultCode: 200, success: true });
      logger.info('TestResultsPersisterQueue::sendMessages: Added Results to TR Persister queue', {
        ...getIdentifiers(record),
      });
    } catch (error) {
      this.logDependency(record, testHistoryContentId, { duration: Date.now() - sendStartDate, resultCode: 500, success: false });
      throw error;
    }
  }

  private logDependency(record: SARASResultQueueRecord, testHistoryContentId?: string, properties?: Props): void {
    logger.dependency('TestResultsPersisterQueue::sendMessages', 'Send Results to TR Persister queue', {
      ...getIdentifiers(record),
      testHistoryContentId: testHistoryContentId,
      ...properties,
    });
  }

}

const serviceBusClient = new ServiceBusClient(config.testResultPersisterServiceBus.connectionString);

export default new TestResultsPersisterQueue(
  serviceBusClient.createSender(config.testResultPersisterServiceBus.eventsQueue.name),
);
