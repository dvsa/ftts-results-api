import { SARASResultBody } from '../../../../src/shared/interfaces';
import { getIdentifiers, getSarasIdentifiers } from '../../../../src/shared/utils/identifiers';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { queueRecord, resultRecordV3 } from '../../../mocks/result-records';

describe('Logging Identifiers', () => {
  describe('Identifiers', () => {
    test('Identifiers can be logged', () => {
      const record = queueRecord();

      const identifiers = getIdentifiers(record);

      expect(identifiers).toStrictEqual({
        appointmentId: record.AppointmentId,
        candidateId: record.Candidate.CandidateID,
        trace_id: record.trace_id,
        context_id: record.context_id,
        reference: record.reference,
      });
    });

    test('Identifiers without AppointmentId can be logged', () => {
      const record = queueRecord();
      delete record.AppointmentId;

      const identifiers = getIdentifiers(record);

      expect(identifiers).toStrictEqual({
        appointmentId: record.AppointmentId,
        candidateId: record.Candidate.CandidateID,
        trace_id: record.trace_id,
        context_id: record.context_id,
        reference: record.reference,
      });
    });

    test('Identifiers without an Appointment can be logged', () => {
      const record = queueRecord();
      delete record.Appointment;

      const identifiers = getIdentifiers(record);

      expect(identifiers).toStrictEqual({
        appointmentId: record.AppointmentId,
        candidateId: record.Candidate.CandidateID,
        trace_id: record.trace_id,
        context_id: record.context_id,
        reference: record.reference,
      });
    });
  });

  describe('Saras Identifiers', () => {
    let sarasResultBody: SARASResultBody;
    let resultQueueRecord: SARASResultQueueRecord;
    beforeEach(() => {
      sarasResultBody = { ...resultRecordV3 };
      resultQueueRecord = queueRecord();
    });

    test('Return saras identifiers for Saras Result Body', () => {
      const identifiers = getSarasIdentifiers(sarasResultBody);

      expect(identifiers).toStrictEqual({
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testEndTime: '2020-07-24T10:20:02.754Z',
        testType: 'CAR',
      });
    });

    test('Return saras identifiers for Queue Record', () => {
      const identifiers = getSarasIdentifiers(resultQueueRecord);

      expect(identifiers).toStrictEqual({
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testEndTime: undefined,
        testType: 'CAR',
      });
    });

    test('Return saras identifiers with missing data - do not throw', () => {
      delete sarasResultBody.TestInformation.OverallStatus;
      delete sarasResultBody.TestInformation.TestType;
      const identifiers = getSarasIdentifiers(sarasResultBody);

      expect(identifiers).toStrictEqual({
        testCentreCode: 'mockTestCentreCode',
        testEndTime: '2020-07-24T10:20:02.754Z',
        testOverallStatus: undefined,
        testType: undefined,
      });
    });
  });
});
