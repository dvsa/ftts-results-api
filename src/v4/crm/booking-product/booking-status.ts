import { SARASStatus } from '../../../shared/interfaces';

export enum CRMBookingStatus {
  COMPLETED_FAILED = 675030005,
  COMPLETED_PASSED = 675030004,
}

export function mapBookingStatusFromSARAS(status: SARASStatus): CRMBookingStatus {
  switch (status) {
    case SARASStatus.FAIL:
      return CRMBookingStatus.COMPLETED_FAILED;
    case SARASStatus.PASS:
      return CRMBookingStatus.COMPLETED_PASSED;
    default:
      throw new Error(`Error mapping SARASStatus to CRMBookingStatus. SARASStatus = ${status}`);
  }
}
