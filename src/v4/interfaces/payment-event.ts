import { CRMTestStatuses, CRMTestStatus } from '../crm/common/test-status';
import { SARASResultQueueRecord } from './result';

export interface PaymentEventRecord {
  type: PaymentEventType;
  testStatus: CRMTestStatuses;
  bookingProductId: string;
  trace_id: string;
}

export enum PaymentEventType {
  RESULT_EVENT = 'ResultEvent',
}

export const toPaymentEventRecord = (queueRecord: SARASResultQueueRecord): PaymentEventRecord => {
  if (!queueRecord.bookingProductId) {
    throw new Error('toPaymentEventRecord:: Booking Product Id not set');
  }

  return {
    type: PaymentEventType.RESULT_EVENT,
    testStatus: CRMTestStatus.mapFromSARAS(queueRecord.TestInformation.OverallStatus),
    bookingProductId: queueRecord.bookingProductId,
    trace_id: queueRecord.trace_id || '',
  };
};

export class PaymentEventError extends Error { }
