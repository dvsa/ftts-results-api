import { QueueRecordValidator } from '../../../../src/v3/utils/queue-record-validator';
import { queueRecord } from '../../../mocks/result-records';
import { QueueRecord } from '../../../../src/v3/interfaces';

describe('QueueRecordValidator', () => {
  describe('Arrival Queue Record', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('returns true for valid requests', () => {
      const mockQueueRecord: QueueRecord = queueRecord();

      expect(QueueRecordValidator.validateResultQueueRecord(mockQueueRecord)).toBe(true);
    });

    test('throws error for invalid requests', () => {
      const mockQueueRecord: QueueRecord = queueRecord();
      delete mockQueueRecord.Candidate;

      expect(() => QueueRecordValidator.validateResultQueueRecord(mockQueueRecord))
        .toThrow('Validation Error - data should have required property \'Candidate\'');
    });

    test('throws error for missing tracingId', () => {
      const mockQueueRecord: QueueRecord = queueRecord();
      delete mockQueueRecord.trace_id;

      expect(() => QueueRecordValidator.validateResultQueueRecord(mockQueueRecord))
        .toThrow('Validation Error - Record should have required property trace_id');
    });

    test('throws error for missing appointmentId', () => {
      const mockQueueRecord: QueueRecord = queueRecord();
      delete mockQueueRecord.AppointmentId;

      expect(() => QueueRecordValidator.validateResultQueueRecord(mockQueueRecord))
        .toThrow('Validation Error - Record should have required property AppointmentId');
    });

    test('throws error for empty body', () => {
      expect(() => QueueRecordValidator.validateResultQueueRecord(null as any))
        .toThrow('Validation Error - Record body is empty or not valid');
    });
  });
});
