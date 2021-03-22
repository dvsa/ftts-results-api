import { SARASStatus } from '../../../shared/interfaces';

export enum CRMTestStatuses {
  FAIL = 1,
  PASS = 2,
  NOT_STARTED = 3,
  INCOMPLETE = 4,
  NEGATED = 5,
}

export class CRMTestStatus {
  public static toString(testStatus?: CRMTestStatuses): string {
    switch (testStatus) {
      case CRMTestStatuses.FAIL:
        return 'Fail';
      case CRMTestStatuses.PASS:
        return 'Pass';
      case CRMTestStatuses.NOT_STARTED:
        return 'Not started';
      case CRMTestStatuses.INCOMPLETE:
        return 'Incomplete';
      case CRMTestStatuses.NEGATED:
        return 'Negated';
      default:
        return '';
    }
  }

  public static mapFromSARAS(status: SARASStatus): CRMTestStatuses {
    switch (status) {
      case SARASStatus.FAIL:
        return CRMTestStatuses.FAIL;
      case SARASStatus.PASS:
        return CRMTestStatuses.PASS;
      case SARASStatus.NOT_STARTED:
        return CRMTestStatuses.NOT_STARTED;
      case SARASStatus.INCOMPLETE:
        return CRMTestStatuses.INCOMPLETE;
      default:
        throw new Error(`Error Mapping SARAS Test Status - value ${status as SARASStatus}`);
    }
  }

  public static optionalMapFromSARAS(status: SARASStatus | undefined): CRMTestStatuses | undefined {
    if (status === undefined) {
      return undefined;
    }
    return CRMTestStatus.mapFromSARAS(status);
  }
}
