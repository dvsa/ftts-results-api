import { SARASStatus, SARASTestType } from '../../../../src/shared/interfaces';
import { getSarasStatusLabel, getSarasTestTypeLabel } from '../../../../src/v4/utils/mapper';

describe('mapper', () => {
  test('getSarasTestTypeLabel', () => {
    expect(getSarasTestTypeLabel(SARASTestType.CAR)).toBe('CAR');
    expect(getSarasTestTypeLabel(SARASTestType.MOTORCYCLE)).toBe('MOTORCYCLE');
    expect(getSarasTestTypeLabel(SARASTestType.LGVMC)).toBe('LGVMC');
    expect(getSarasTestTypeLabel(SARASTestType.LGVHPT)).toBe('LGVHPT');
    expect(getSarasTestTypeLabel(SARASTestType.LGVCPC)).toBe('LGVCPC');
    expect(getSarasTestTypeLabel(SARASTestType.LGVCPCC)).toBe('LGVCPCC');
    expect(getSarasTestTypeLabel(SARASTestType.PCVMC)).toBe('PCVMC');
    expect(getSarasTestTypeLabel(SARASTestType.PCVHPT)).toBe('PCVHPT');
    expect(getSarasTestTypeLabel(SARASTestType.PCVCPC)).toBe('PCVCPC');
    expect(getSarasTestTypeLabel(SARASTestType.PCVCPCC)).toBe('PCVCPCC');
    expect(getSarasTestTypeLabel(SARASTestType.ADI1)).toBe('ADI1');
    expect(getSarasTestTypeLabel(SARASTestType.ADIHPT)).toBe('ADIHPT');
    expect(getSarasTestTypeLabel(SARASTestType.ERS)).toBe('ERS');
    expect(getSarasTestTypeLabel(SARASTestType.AMI1)).toBe('AMI1');
    expect(getSarasTestTypeLabel(SARASTestType.TAXI)).toBe('TAXI');
    expect(getSarasTestTypeLabel(SARASTestType.EXAMINER_CAR)).toBe('EXAMINER_CAR');
  });

  test('getSarasStatusLabel', () => {
    expect(getSarasStatusLabel(SARASStatus.FAIL)).toBe('FAIL');
    expect(getSarasStatusLabel(SARASStatus.PASS)).toBe('PASS');
    expect(getSarasStatusLabel(SARASStatus.NOT_STARTED)).toBe('NOT_STARTED');
    expect(getSarasStatusLabel(SARASStatus.INCOMPLETE)).toBe('INCOMPLETE');
  });
});
