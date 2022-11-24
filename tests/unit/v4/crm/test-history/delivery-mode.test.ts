import { CRMDeliveryMode, CRMDeliveryModes } from '../../../../../src/v4/crm/test-history/delivery-mode';
import { SARASDeliveryMode } from '../../../../../src/shared/interfaces';

describe('CRMDeliveryMode', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras delivery mode WHEN called THEN the crm delivery mode is returned', () => {
      expect(CRMDeliveryMode.mapFromSARAS(SARASDeliveryMode.IHTTC)).toEqual(CRMDeliveryModes.IHTTC);
      expect(CRMDeliveryMode.mapFromSARAS(SARASDeliveryMode.PERMANENT_TEST_CENTRE)).toEqual(CRMDeliveryModes.PERMANENT_TEST_CENTRE);
      expect(CRMDeliveryMode.mapFromSARAS(SARASDeliveryMode.OCCASIONAL_TEST_CENTRE)).toEqual(CRMDeliveryModes.OCCASIONAL_TEST_CENTRE);
      expect(CRMDeliveryMode.mapFromSARAS(SARASDeliveryMode.AT_HOME)).toEqual(CRMDeliveryModes.AT_HOME);
      expect(CRMDeliveryMode.mapFromSARAS(undefined)).toBeUndefined();
      expect(() => CRMDeliveryMode.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASDeliveryMode - value 99'));
    });
  });
});
