import { queueRecord } from '../../../mocks/result-records';
import { toPaymentEventRecord, PaymentEventType } from '../../../../src/v4/interfaces/payment-event';
import { CRMTestStatuses } from '../../../../src/v4/crm/common/test-status';

describe('Payment Event Record', () => {
  test('Can map a queue record to a payment event record', () => {
    const record = queueRecord();

    const paymentEventRecord = toPaymentEventRecord(record);

    expect(paymentEventRecord).toStrictEqual({
      type: PaymentEventType.RESULT_EVENT,
      testStatus: CRMTestStatuses.PASS,
      bookingProductId: 'mockBookingProductId',
      trace_id: 'testTraceId',
    });
  });

  test('Throw error if booking product id is not present in record', () => {
    const record = queueRecord();
    delete record.bookingProductId;

    expect(() => toPaymentEventRecord(record))
      .toThrow('Booking Product Id not set');
  });
});
