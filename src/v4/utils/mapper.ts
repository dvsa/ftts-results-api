import { SARASStatus, SARASTestType } from '../../shared/interfaces';

const SARAS_TEST_TYPE_LABEL: Map<SARASTestType, string> = new Map([
  [SARASTestType.CAR, 'CAR'],
  [SARASTestType.MOTORCYCLE, 'MOTORCYCLE'],
  [SARASTestType.LGVMC, 'LGVMC'],
  [SARASTestType.LGVHPT, 'LGVHPT'],
  [SARASTestType.LGVCPC, 'LGVCPC'],
  [SARASTestType.LGVCPCC, 'LGVCPCC'],
  [SARASTestType.PCVMC, 'PCVMC'],
  [SARASTestType.PCVHPT, 'PCVHPT'],
  [SARASTestType.PCVCPC, 'PCVCPC'],
  [SARASTestType.PCVCPCC, 'PCVCPCC'],
  [SARASTestType.ADI1, 'ADI1'],
  [SARASTestType.ADIHPT, 'ADIHPT'],
  [SARASTestType.ERS, 'ERS'],
  [SARASTestType.AMI1, 'AMI1'],
  [SARASTestType.TAXI, 'TAXI'],
  [SARASTestType.EXAMINER_CAR, 'EXAMINER_CAR'],
]);

const SARAS_TEST_STATUS_LABEL: Map<SARASStatus, string> = new Map([
  [SARASStatus.FAIL, 'FAIL'],
  [SARASStatus.PASS, 'PASS'],
  [SARASStatus.NOT_STARTED, 'NOT_STARTED'],
  [SARASStatus.INCOMPLETE, 'INCOMPLETE'],
]);

export const getSarasTestTypeLabel = (sarasTestType: SARASTestType): string | undefined => SARAS_TEST_TYPE_LABEL.get(sarasTestType);

export const getSarasStatusLabel = (testStatus: SARASStatus): string | undefined => SARAS_TEST_STATUS_LABEL.get(testStatus);
