import Semaphore from 'semaphore-async-await';
import { DeadLetterOptions, ServiceBusClient, ServiceBusReceiver, ServiceBusSender } from '@azure/service-bus';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import config from '../../shared/config';
import { getIdentifiers } from '../../shared/utils/identifiers';
import { logger } from '../../shared/utils/logger';
import { SARASResultQueueRecord, QueueRecordServiceBusMessage } from '../interfaces';

export class ArrivalQueue {

  constructor(private sender: ServiceBusSender, private receiver: ServiceBusReceiver, private lock: Semaphore) {}

  public async sendMessage(record: SARASResultQueueRecord): Promise<void> {
    logger.debug('ArrivalQueue::send: Adding Result to arrival queue', {
      ...getIdentifiers(record),
      payload: record,
    });

    const sendStartDate = Date.now();

    try {
      await this.sender.sendMessages({
        body: record,
        contentType: 'application/json',
        applicationProperties: {
          sendStartDate,
        },
      });

      this.logSuccessfulDependency('sendMessage', 'Send Result to arrival queue', { duration: Date.now() - sendStartDate }, record);
      logger.info('ArrivalQueue::send: Added Result to arrival queue', {
        ...getIdentifiers(record),
      });
    } catch (error) {
      this.logFailedDependency('sendMessage', 'Send Result to arrival queue', { duration: Date.now() - sendStartDate }, record);
      throw error;
    }
  }

  public async receiveMessages(numberOfResults?: number): Promise<QueueRecordServiceBusMessage[]> {
    const beforeTime = Date.now();

    try {
      await this.lock.acquire();
      const messages: QueueRecordServiceBusMessage[] = await this.receiver.receiveMessages(numberOfResults || config.resultsServiceBus.arrivalQueue.retrieveCount);
      this.lock.release();
      this.logSuccessfulDependency('receiveMessages', 'Receive results from arrival queue', { duration: Date.now() - beforeTime });

      return messages;
    } catch (error) {
      this.logFailedDependency('receiveMessages', 'Receive results from arrival queue', { duration: Date.now() - beforeTime });
      throw error;
    }
  }

  public async completeMessage(queueRecordServiceBusMessage: QueueRecordServiceBusMessage): Promise<void> {
    const beforeTime = Date.now();
    try {
      await this.receiver.completeMessage(queueRecordServiceBusMessage);
      this.logSuccessfulDependency('completeMessage', 'Complete result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
    } catch (error) {
      this.logFailedDependency('completeMessage', 'Complete result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
      throw error;
    }
  }

  public async abandonMessage(queueRecordServiceBusMessage: QueueRecordServiceBusMessage, serviceBusProps?: Record<string, unknown>): Promise<void> {
    const beforeTime = Date.now();
    try {
      await this.receiver.abandonMessage(queueRecordServiceBusMessage, serviceBusProps);
      this.logSuccessfulDependency('abandonMessage', 'Abandon result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
    } catch (error) {
      this.logFailedDependency('abandonMessage', 'Abandon result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
      throw error;
    }
  }

  public async deadLetterMessage(queueRecordServiceBusMessage: QueueRecordServiceBusMessage, options?: DeadLetterOptions): Promise<void> {
    const beforeTime = Date.now();
    try {
      await this.receiver.deadLetterMessage(queueRecordServiceBusMessage, options);
      this.logSuccessfulDependency('deadLetterMessage', 'Dead letter the result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
    } catch (error) {
      this.logFailedDependency('deadLetterMessage', 'Dead letter the result in arrival queue', { duration: Date.now() - beforeTime }, queueRecordServiceBusMessage?.body);
      throw error;
    }
  }

  private logSuccessfulDependency(method: string, data?: string, properties?: Props, record?: SARASResultQueueRecord): void {
    logger.dependency(`ArrivalQueue::${method}`, data, {
      ...getIdentifiers(record),
      dependencyTypeName: 'AMQP',
      target: 'Arrival Queue',
      resultCode: 200,
      success: true,
      ...properties,
    });
  }

  private logFailedDependency(method: string, data?: string, properties?: Props, record?: SARASResultQueueRecord): void {
    logger.dependency(`ArrivalQueue::${method}`, data, {
      ...getIdentifiers(record),
      dependencyTypeName: 'AMQP',
      target: 'Arrival Queue',
      resultCode: 500,
      success: false,
      ...properties,
    });
  }
}

const serviceBusClient = new ServiceBusClient(config.resultsServiceBus.connectionString);

export default new ArrivalQueue(
  serviceBusClient.createSender(config.resultsServiceBus.arrivalQueue.name),
  serviceBusClient.createReceiver(config.resultsServiceBus.arrivalQueue.name, {
    receiveMode: 'peekLock',
  }),
  new Semaphore(1),
);
