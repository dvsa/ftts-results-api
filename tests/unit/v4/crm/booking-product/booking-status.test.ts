import { CRMBookingStatus, mapBookingStatusFromSARAS } from '../../../../../src/v4/crm/booking-product/booking-status';
import { SARASStatus } from '../../../../../src/shared/interfaces';

describe('CRMBookingStatus', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras test status of fail WHEN called THEN the crm booking status of completed fail is returned', () => {
      expect(mapBookingStatusFromSARAS(SARASStatus.FAIL)).toEqual(CRMBookingStatus.COMPLETED_FAILED);
    });
    test('GIVEN a saras test status of pass WHEN called THEN the crm booking status of completed pass is returned', () => {
      expect(mapBookingStatusFromSARAS(SARASStatus.PASS)).toEqual(CRMBookingStatus.COMPLETED_PASSED);
    });
    test('GIVEN a saras test status of not started WHEN called THEN an error is thrown', () => {
      expect(() => mapBookingStatusFromSARAS(SARASStatus.NOT_STARTED))
        .toThrow(new Error(`Error mapping SARASStatus to CRMBookingStatus. SARASStatus = ${SARASStatus.NOT_STARTED}`));
    });
    test('GIVEN a saras test status of incomplete WHEN called THEN an error is thrown', () => {
      expect(() => mapBookingStatusFromSARAS(SARASStatus.INCOMPLETE))
        .toThrow(new Error(`Error mapping SARASStatus to CRMBookingStatus. SARASStatus = ${SARASStatus.INCOMPLETE}`));
    });
    test('GIVEN a invalid saras test status WHEN called THEN an error is thrown', () => {
      expect(() => mapBookingStatusFromSARAS(99))
        .toThrow(new Error('Error mapping SARASStatus to CRMBookingStatus. SARASStatus = 99'));
    });
  });
});
