import ExpiryDate from '../../../../../src/v3/crm/test-history/expiry-date';
import { SARASStatus } from '../../../../../src/shared/interfaces';
import { Organisation } from '../../../../../src/v3/crm/account/remit';

describe('ExpiryDate', () => {
  test('should return undefined if test status is a fail', () => {
    expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.FAIL, Organisation.DVA)).toBeUndefined();
  });
  test('should return undefined if test status is incomplete', () => {
    expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.INCOMPLETE, Organisation.DVA)).toBeUndefined();
  });
  test('should return undefined if test status is not started', () => {
    expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.NOT_STARTED, Organisation.DVA)).toBeUndefined();
  });
  test('should return undefined if test date is not defined', () => {
    expect(ExpiryDate.calculateExpiryDate(undefined, SARASStatus.PASS, Organisation.DVA)).toBeUndefined();
  });
  test('should return undefined if organisation is not defined', () => {
    expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.PASS, undefined)).toBeUndefined();
  });
  describe('calculateExpiryDate', () => {
    describe('DVSA', () => {
      test('if test is passed on the 7th August 2020 then the expiry date will be 6th August 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.PASS, Organisation.DVSA)).toEqual('2022-08-06');
      });
      test('if test is passed on the 29th February 2020 then the expiry date will be 28th February 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-02-29', SARASStatus.PASS, Organisation.DVSA)).toEqual('2022-02-28');
      });
      test('if test is passed on the 1st March 2020 then the expiry date will be 28th February 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-03-01', SARASStatus.PASS, Organisation.DVSA)).toEqual('2022-02-28');
      });
      test('if test is passed on the 28th February 2018 then the expiry date will be 27th February 2020', () => {
        expect(ExpiryDate.calculateExpiryDate('2018-02-28', SARASStatus.PASS, Organisation.DVSA)).toEqual('2020-02-27');
      });
      test('if test is passed on the 1st March 2018 then the expiry date will be 29th February 2020', () => {
        expect(ExpiryDate.calculateExpiryDate('2018-03-01', SARASStatus.PASS, Organisation.DVSA)).toEqual('2020-02-29');
      });
    });
    describe('DVA', () => {
      test('if test is passed on 7th August 2020 then the expiry date will be 7th August 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-08-07', SARASStatus.PASS, Organisation.DVA)).toEqual('2022-08-07');
      });
      test('if test is passed on 28th February 2020 then the expiry date will be 28th February 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-02-28', SARASStatus.PASS, Organisation.DVA)).toEqual('2022-02-28');
      });
      test('if test is passed on 29th February 2020 then the expiry date will be 28th February 2022', () => {
        expect(ExpiryDate.calculateExpiryDate('2020-02-29', SARASStatus.PASS, Organisation.DVA)).toEqual('2022-02-28');
      });
      test('if test is passed on 28th February 2018 then the expiry date will be 28th February 2020', () => {
        expect(ExpiryDate.calculateExpiryDate('2018-02-28', SARASStatus.PASS, Organisation.DVA)).toEqual('2020-02-28');
      });
      test('if test is passed on 1st March 2018 then the expiry date will be 1st March 2020', () => {
        expect(ExpiryDate.calculateExpiryDate('2018-03-01', SARASStatus.PASS, Organisation.DVA)).toEqual('2020-03-01');
      });
    });
  });
});
