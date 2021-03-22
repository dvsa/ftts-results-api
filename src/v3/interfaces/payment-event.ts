import { CRMTestStatuses, CRMTestStatus } from '../crm/common/test-status';
import { QueueRecord } from './result';

export interface PaymentEventRecord {
  type: PaymentEventType;
  testStatus: CRMTestStatuses;
  bookingProductId: string;
  trace_id: string;
}

export enum PaymentEventType {
  RESULT_EVENT = 'ResultEvent',
}

export const toPaymentEventRecord = (queueRecord: QueueRecord): PaymentEventRecord => {
  if (!queueRecord.bookingProductId) {
    throw new Error('toPaymentEvent:: Booking Product Id not set');
  }

  return {
    type: PaymentEventType.RESULT_EVENT,
    testStatus: CRMTestStatus.mapFromSARAS(queueRecord.TestInformation.OverallStatus),
    bookingProductId: queueRecord.bookingProductId,
    trace_id: queueRecord.trace_id || '',
  };
};

export class PaymentEventError extends Error { }
