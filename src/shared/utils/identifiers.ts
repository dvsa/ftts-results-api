import { BusinessIdentifiers, SARASResultQueueRecord } from '../../v4/interfaces';
import { getSarasStatusLabel, getSarasTestTypeLabel } from '../../v4/utils/mapper';
import { SARASResultBody } from '../interfaces';

type SarasIdentifiers = {
  testCentreCode?: string;
  testType?: string;
  testOverallStatus?: string;
  testEndTime?: string;
};

export const getSarasIdentifiers = (sarasResultBody: SARASResultBody): SarasIdentifiers => ({
  testCentreCode: sarasResultBody?.TestCentre?.TestCentreCode,
  testType: getSarasTestTypeLabel(sarasResultBody?.TestInformation?.TestType),
  testOverallStatus: getSarasStatusLabel(sarasResultBody?.TestInformation?.OverallStatus),
  testEndTime: sarasResultBody?.TestInformation?.EndTime,
});

export const getIdentifiers = (queueRecord?: SARASResultQueueRecord): BusinessIdentifiers => ({
  appointmentId: queueRecord?.AppointmentId,
  candidateId: queueRecord?.Candidate?.CandidateID,
  reference: queueRecord?.reference,
  context_id: queueRecord?.context_id,
  trace_id: queueRecord?.trace_id,
});
