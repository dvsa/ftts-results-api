import { Context } from '@azure/functions';
import {
  ServiceBusClient,
  QueueClient,
  Sender,
} from '@azure/service-bus';
import { Service } from 'typedi';
import config from '../../shared/config';
import { logger, getIdentifiers } from '../../shared/utils/logger';
import { PaymentEventRecord, toPaymentEventRecord } from '../interfaces/payment-event';
import { QueueRecord } from '../interfaces';

@Service()
class PaymentEventsQueue {
  private paymentQueueClient: QueueClient;

  private paymentQueueSender: Sender;

  constructor() {
    const serviceBusClient = ServiceBusClient.createFromConnectionString(config.paymentsServiceBus.connectionString);
    this.paymentQueueClient = serviceBusClient.createQueueClient(config.paymentsServiceBus.eventsQueue.name);
    this.paymentQueueSender = this.paymentQueueClient.createSender();
  }

  public async send(context: Context, record: QueueRecord): Promise<void> {
    const paymentEvent: PaymentEventRecord = toPaymentEventRecord(record);
    const operationId = logger.getOperationId(context);
    const parentId = context.traceContext.traceparent;
    const sendStartDate = Date.now();

    await this.paymentQueueSender.send({
      body: paymentEvent,
      correlationId: operationId,
      userProperties: {
        operationId,
        parentId,
      },
    });

    logger.dependency(context, 'Payments Queue', 'Sent Result Status to payments events queue', {
      dependencyTypeName: 'AMQP',
      target: 'Payment Events Queue',
      duration: Date.now() - sendStartDate,
      resultCode: 200,
      success: true,
      id: context.traceContext.traceparent,
    });
    logger.log(`Successfully added Result Status to payments events queue ${getIdentifiers(record)}`, { context });
  }
}

export default PaymentEventsQueue;
