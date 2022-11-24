import { CRMTestStatus, CRMTestStatuses } from '../../../../../src/v4/crm/common/test-status';
import { SARASStatus } from '../../../../../src/shared/interfaces';

describe('CRMTestStatus', () => {
  describe('toString', () => {
    test('GIVEN a test status WHEN called THEN the test status\'s string representation is returned', () => {
      expect(CRMTestStatus.toString(CRMTestStatuses.FAIL)).toBe('Fail');
      expect(CRMTestStatus.toString(CRMTestStatuses.PASS)).toBe('Pass');
      expect(CRMTestStatus.toString(CRMTestStatuses.NOT_STARTED)).toBe('Not started');
      expect(CRMTestStatus.toString(CRMTestStatuses.INCOMPLETE)).toBe('Incomplete');
      expect(CRMTestStatus.toString(CRMTestStatuses.NEGATED)).toBe('Negated');
      expect(CRMTestStatus.toString(0)).toBe('');
    });
  });

  describe('mapFromSARAS', () => {
    test('GIVEN a saras test status WHEN called THEN the crm test status is returned', () => {
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.FAIL)).toBe(CRMTestStatuses.FAIL);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.PASS)).toBe(CRMTestStatuses.PASS);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.NOT_STARTED)).toBe(CRMTestStatuses.NOT_STARTED);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.INCOMPLETE)).toBe(CRMTestStatuses.INCOMPLETE);
      expect(() => CRMTestStatus.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARAS Test Status - value 99'));
    });
  });
  describe('optionalMapFromSARAS', () => {
    test('GIVEN a saras test status WHEN called THEN the crm test status is returned', () => {
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.FAIL)).toBe(CRMTestStatuses.FAIL);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.PASS)).toBe(CRMTestStatuses.PASS);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.NOT_STARTED)).toBe(CRMTestStatuses.NOT_STARTED);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.INCOMPLETE)).toBe(CRMTestStatuses.INCOMPLETE);
      expect(CRMTestStatus.optionalMapFromSARAS(undefined)).toBeUndefined();
      expect(() => CRMTestStatus.optionalMapFromSARAS(99)).toThrow(new Error('Error Mapping SARAS Test Status - value 99'));
    });
  });
});
