import { CRMTestStatus, CRMTestStatuses } from '../../../../../src/v3/crm/common/test-status';
import { SARASStatus } from '../../../../../src/shared/interfaces';

describe('CRMTestStatus', () => {
  describe('toString', () => {
    test('GIVEN a test status WHEN called THEN the test status\'s string representation is returned', () => {
      expect(CRMTestStatus.toString(CRMTestStatuses.FAIL)).toEqual('Fail');
      expect(CRMTestStatus.toString(CRMTestStatuses.PASS)).toEqual('Pass');
      expect(CRMTestStatus.toString(CRMTestStatuses.NOT_STARTED)).toEqual('Not started');
      expect(CRMTestStatus.toString(CRMTestStatuses.INCOMPLETE)).toEqual('Incomplete');
      expect(CRMTestStatus.toString(CRMTestStatuses.NEGATED)).toEqual('Negated');
      expect(CRMTestStatus.toString(0)).toEqual('');
    });
  });
  describe('mapFromSARAS', () => {
    test('GIVEN a saras test status WHEN called THEN the crm test status is returned', () => {
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.FAIL)).toEqual(CRMTestStatuses.FAIL);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.PASS)).toEqual(CRMTestStatuses.PASS);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.NOT_STARTED)).toEqual(CRMTestStatuses.NOT_STARTED);
      expect(CRMTestStatus.mapFromSARAS(SARASStatus.INCOMPLETE)).toEqual(CRMTestStatuses.INCOMPLETE);
      expect(() => CRMTestStatus.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARAS Test Status - value 99'));
    });
  });
  describe('optionalMapFromSARAS', () => {
    test('GIVEN a saras test status WHEN called THEN the crm test status is returned', () => {
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.FAIL)).toEqual(CRMTestStatuses.FAIL);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.PASS)).toEqual(CRMTestStatuses.PASS);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.NOT_STARTED)).toEqual(CRMTestStatuses.NOT_STARTED);
      expect(CRMTestStatus.optionalMapFromSARAS(SARASStatus.INCOMPLETE)).toEqual(CRMTestStatuses.INCOMPLETE);
      expect(CRMTestStatus.optionalMapFromSARAS(undefined)).toEqual(undefined);
      expect(() => CRMTestStatus.optionalMapFromSARAS(99)).toThrow(new Error('Error Mapping SARAS Test Status - value 99'));
    });
  });
});
