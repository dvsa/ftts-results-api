import { Context } from '@azure/functions';
import {
  ServiceBusClient,
  QueueClient,
  Sender,
} from '@azure/service-bus';
import { Service } from 'typedi';
import config from '../../shared/config';
import { logger, getIdentifiers } from '../../shared/utils/logger';
import { QueueRecord, QueueMessage } from '../interfaces';

@Service()
class ArrivalQueue {
  private arrivalQueueClient: QueueClient;

  private arrivalQueueSender: Sender;

  constructor() {
    const serviceBusClient = ServiceBusClient.createFromConnectionString(config.resultsServiceBus.connectionString);
    this.arrivalQueueClient = serviceBusClient.createQueueClient(config.resultsServiceBus.arrivalQueue.name);
    this.arrivalQueueSender = this.arrivalQueueClient.createSender();
  }

  public async send(context: Context, record: QueueRecord): Promise<void> {
    const queueMessage: QueueMessage = { body: record };
    const operationId = logger.getOperationId(context);
    const parentId = context.traceContext.traceparent;
    const sendStartDate = Date.now();
    await this.arrivalQueueSender.send({
      body: queueMessage,
      correlationId: operationId,
      userProperties: {
        operationId,
        parentId,
        sendStartDate,
      },
    });

    logger.request(context, 'Arrival Queue', {
      url: context.req?.url,
      duration: Date.now() - sendStartDate,
      resultCode: 200,
      success: true,
      id: parentId,
    });

    logger.log(`Added Result to arrival queue - ${getIdentifiers(record)}`, { context });
  }

  public async handleSendFailureRetry(context: Context, record: QueueRecord): Promise<void> {
    if ((record.noOfArrivalQueueRetries || 0) >= config.resultsServiceBus.arrivalQueue.maxRetryCount) {
      logger.info(`Sender: reached max retry count, abandoning ${getIdentifiers(record)}`, { context });
      throw new Error(); // Throw error to abandon message
    } else {
      await this.scheduleMessageForRetry(context, record);
    }
  }

  public async scheduleMessageForRetry(context: Context, record: QueueRecord): Promise<void> {
    record.noOfArrivalQueueRetries = record.noOfArrivalQueueRetries !== undefined ? record.noOfArrivalQueueRetries + 1 : 0;
    const operationId = logger.getOperationId(context);
    const parentId = context.traceContext.traceparent;
    const delay = config.resultsServiceBus.arrivalQueue.maxRetryDelay * (record.noOfArrivalQueueRetries || 0);
    const retryTime = new Date(Date.now() + delay);
    const queueMessage: QueueMessage = { body: record };
    const sendStartDate = Date.now();

    await this.arrivalQueueSender.scheduleMessage(retryTime, {
      body: queueMessage,
      correlationId: operationId,
      userProperties: {
        operationId,
        parentId,
        sendStartDate,
      },
    });

    logger.request(context, 'Arrival Queue', {
      url: context.req?.url,
      duration: Date.now() - sendStartDate,
      resultCode: 200,
      success: true,
      id: parentId,
    });
    logger.info(`Sender: scheduled message for retry at ${retryTime.toISOString()} ${getIdentifiers(record)}`, { context });
  }
}

export default ArrivalQueue;
