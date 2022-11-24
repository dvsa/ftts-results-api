import {
  ServiceBusClient, ServiceBusSender,
} from '@azure/service-bus';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import config from '../../shared/config';
import { getIdentifiers } from '../../shared/utils/identifiers';
import { logger } from '../../shared/utils/logger';
import { SARASResultQueueRecord } from '../interfaces';
import { PaymentEventRecord, toPaymentEventRecord } from '../interfaces/payment-event';

export class PaymentEventsQueue {
  constructor(private sender: ServiceBusSender) { }

  public async sendMessages(record: SARASResultQueueRecord): Promise<void> {
    const paymentEvent: PaymentEventRecord = toPaymentEventRecord(record);
    const sendStartDate = Date.now();

    logger.debug('PaymentsEventsQueue::send: Sending result status to payments events queue', {
      ...getIdentifiers(record),
      record,
    });

    try {
      await this.sender.sendMessages({
        body: paymentEvent,
      });

      this.logSuccessfulDependency(record, { duration: Date.now() - sendStartDate });
      logger.info('PaymentsEventsQueue::send: Added Result Status to payments events queue', {
        ...getIdentifiers(record),
      });
    } catch (error) {
      this.logFailedDependency(record, { duration: Date.now() - sendStartDate });
      throw error;
    }
  }

  private logSuccessfulDependency(record: SARASResultQueueRecord, properties?: Props): void {
    logger.dependency('PaymentsEventsQueue::send', 'Send Result Status to payments events queue', {
      ...getIdentifiers(record),
      dependencyTypeName: 'AMQP',
      target: 'Payment Events Queue',
      resultCode: 200,
      success: true,
      ...properties,
    });
  }

  private logFailedDependency(record: SARASResultQueueRecord, properties?: Props): void {
    logger.dependency('PaymentsEventsQueue::send', 'Send Result Status to payments events queue', {
      ...getIdentifiers(record),
      dependencyTypeName: 'AMQP',
      target: 'Payment Events Queue',
      resultCode: 500,
      success: false,
      ...properties,
    });
  }
}

const serviceBusClient = new ServiceBusClient(config.paymentsServiceBus.connectionString);

export default new PaymentEventsQueue(
  serviceBusClient.createSender(config.paymentsServiceBus.eventsQueue.name),
);
