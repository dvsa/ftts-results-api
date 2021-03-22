import { queueRecord } from '../../../mocks/result-records';
import { getIdentifiers } from '../../../../src/shared/utils/logger';

describe('Logging queueRecord', () => {
  test('Identifiers can be logged', () => {
    const record = queueRecord();

    const identifiers = getIdentifiers(record);

    expect(identifiers).toStrictEqual(JSON.stringify({
      appointmentId: record.AppointmentId,
      candidateId: record.Candidate.CandidateID,
      trace_id: record.trace_id,
    }));
  });

  test('Identifiers without AppointmentId can be logged', () => {
    const record = queueRecord();
    delete record.AppointmentId;

    const identifiers = getIdentifiers(record);

    expect(identifiers).toStrictEqual(JSON.stringify({
      appointmentId: record.AppointmentId,
      candidateId: record.Candidate.CandidateID,
      trace_id: record.trace_id,
    }));
  });

  test('Identifiers without an Appointment can be logged', () => {
    const record = queueRecord();
    delete record.Appointment;

    const identifiers = getIdentifiers(record);

    expect(identifiers).toStrictEqual(JSON.stringify({
      appointmentId: record.AppointmentId,
      candidateId: record.Candidate.CandidateID,
      trace_id: record.trace_id,
    }));
  });
});
