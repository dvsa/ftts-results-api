import { toDigitalResults } from '../../../../src/v4/interfaces/digital-results';
import { queueRecord } from '../../../mocks/result-records';
import { mockBookingProduct } from '../../../mocks/crm-records';
import { CRMBookingProduct } from '../../../../src/shared/crm/booking-product/interfaces';
import { CRMRemit } from '../../../../src/shared/crm/account/remit';

describe('Digital Results', () => {

  describe('toDigitalResults()', () => {
    test('should map a queue record and booking product to a digital result', () => {
      const record = queueRecord();
      const expectedDigitalResultsRecord = { ... record };

      delete expectedDigitalResultsRecord.trace_id;
      delete expectedDigitalResultsRecord.context_id;
      delete expectedDigitalResultsRecord.reference;
      delete expectedDigitalResultsRecord.noOfArrivalQueueRetries;
      delete expectedDigitalResultsRecord.sentToCrmAt;
      delete expectedDigitalResultsRecord.AppointmentId;
      delete expectedDigitalResultsRecord.bookingProductId;

      const bookingProductGB = mockBookingProduct();
      const bookingProductNI: CRMBookingProduct = { ...bookingProductGB, ftts_ihttcid: {
        accountid: 'testCentreId',
        ftts_remit: CRMRemit.DVA,
      } };

      const digitalResultsGB = toDigitalResults(record, bookingProductGB);

      expect(digitalResultsGB).toStrictEqual({
        email: bookingProductGB.ftts_CandidateId?.emailaddress1,
        target: 'gb',
        results: expectedDigitalResultsRecord,
        tracing: {
          trace_id: 'testTraceId',
          AppointmentId: 'mockAppointmentId',
          bookingProductId: 'mockBookingProductId',
          context_id: 'mockContextId',
          reference: 'mockReference',
        },
      });

      const digitalResultsNI = toDigitalResults(record, bookingProductNI);
      expect(digitalResultsNI).toStrictEqual({
        email: bookingProductNI.ftts_CandidateId?.emailaddress1,
        target: 'ni',
        results: expectedDigitalResultsRecord,
        tracing: {
          trace_id: 'testTraceId',
          AppointmentId: 'mockAppointmentId',
          bookingProductId: 'mockBookingProductId',
          context_id: 'mockContextId',
          reference: 'mockReference',
        },
      });
    });

    test('should throw error if booking product is not present in record', () => {
      const record = queueRecord();

      expect(() => toDigitalResults(record))
        .toThrow('toDigitalResults:: Booking Product not set');
    });

    test('should throw error if email address not found in the bookingProduct record from CRM', () => {
      const record = queueRecord();
      const bookingProduct = mockBookingProduct();

      delete bookingProduct.ftts_CandidateId;
      expect(() => toDigitalResults(record, bookingProduct))
        .toThrow('Email address not set');
    });

    test('image data should be truncated', () => {
      const record = queueRecord();
      const bookingProduct = mockBookingProduct();

      const truncatedRecord = toDigitalResults(record, bookingProduct);

      expect(truncatedRecord.results.Admission?.CandidatePhoto).toBe('truncated');
      expect(truncatedRecord.results.Admission?.CandidateSignature).toBe('truncated');
      expect(truncatedRecord.results.AccommodationAssistant?.[0].AssistantSignature).toBe('truncated');
    });

    test('image data should be not truncated if are emmpty', () => {
      const record = queueRecord();
      if (record.Admission) {
        record.Admission.CandidatePhoto = '';
        record.Admission.CandidateSignature = '';
      }
      if (record.AccommodationAssistant?.length) {
        record.AccommodationAssistant[0].AssistantSignature = '';
      }
      const bookingProduct = mockBookingProduct();

      const truncatedRecord = toDigitalResults(record, bookingProduct);

      expect(truncatedRecord.results.Admission?.CandidatePhoto).toBe('');
      expect(truncatedRecord.results.Admission?.CandidateSignature).toBe('');
      expect(truncatedRecord.results.AccommodationAssistant?.[0].AssistantSignature).toBe('');
    });
  });

});
