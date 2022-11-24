import {
  ServiceBusClient, ServiceBusSender,
} from '@azure/service-bus';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import config from '../../shared/config';
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';
import { getIdentifiers } from '../../shared/utils/identifiers';
import { logger } from '../../shared/utils/logger';
import { SARASResultQueueRecord } from '../interfaces';
import { DigitalResults, toDigitalResults } from '../interfaces/digital-results';

export class DigitalResultsQueue {
  constructor(private sender: ServiceBusSender) { }

  public async sendMessages(record: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct): Promise<void> {
    const sendStartDate = Date.now();

    try {
      const digitalResults: DigitalResults = toDigitalResults(record, bookingProduct);

      logger.debug('DigitalResultsQueue::send: Sending Results to digital results queue', {
        ...getIdentifiers(record),
        bookingProductReference: bookingProduct?.ftts_reference,
        bookingProductId: bookingProduct?.ftts_bookingproductid,
      });

      await this.sender.sendMessages({
        body: digitalResults,
        correlationId: digitalResults.tracing.trace_id,
        applicationProperties: {
          operationId: digitalResults.tracing.trace_id,
          parentId: digitalResults.tracing.trace_id,
        },
      });

      this.logDependency(record, bookingProduct, { duration: Date.now() - sendStartDate, resultCode: 200, success: true });
      logger.info('DigitalResultsQueue::send: Added Results to digital results queue', {
        ...getIdentifiers(record),
      });
    } catch (error) {
      this.logDependency(record, bookingProduct, { duration: Date.now() - sendStartDate, resultCode: 500, success: false });
      throw error;
    }
  }

  private logDependency(record: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct, properties?: Props): void {
    logger.dependency('DigitalResultsQueue::send', 'Send Results to digital results queue', {
      ...getIdentifiers(record),
      bookingProductReference: bookingProduct?.ftts_reference,
      bookingProductId: bookingProduct?.ftts_bookingproductid,
      dependencyTypeName: 'AMQP',
      target: 'Digital Results Queue',
      ...properties,
    });
  }

}

const serviceBusClient = new ServiceBusClient(config.digitalResultsServiceBus.connectionString);

export default new DigitalResultsQueue(
  serviceBusClient.createSender(config.digitalResultsServiceBus.eventsQueue.name),
);
