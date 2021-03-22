import { CRMColourFormat, CRMColourFormats } from '../../../../../src/v3/crm/test-history/colour-format';
import { SARASColourFormat } from '../../../../../src/shared/interfaces';

describe('CRMColourFormat', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras delivery mode WHEN called THEN the crm colour format is returned', () => {
      expect(CRMColourFormat.mapFromSARAS(SARASColourFormat.NA)).toEqual(CRMColourFormats.NA);
      expect(CRMColourFormat.mapFromSARAS(SARASColourFormat.FORMAT_ONE)).toEqual(CRMColourFormats.FORMAT_ONE);
      expect(CRMColourFormat.mapFromSARAS(SARASColourFormat.FORMAT_TWO)).toEqual(CRMColourFormats.FORMAT_TWO);
      expect(CRMColourFormat.mapFromSARAS(SARASColourFormat.FORMAT_THREE)).toEqual(CRMColourFormats.FORMAT_THREE);
      expect(CRMColourFormat.mapFromSARAS(undefined)).toEqual(undefined);
      expect(() => CRMColourFormat.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASColourFormat - value 99'));
    });
  });
});
