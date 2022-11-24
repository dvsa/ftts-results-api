import { CRMTextLanguage, CRMTextLanguages } from '../../../../../src/v4/crm/test-history/test-language';
import { SARASTextLanguage } from '../../../../../src/shared/interfaces';

describe('CRMTextLanguage', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras text language WHEN called THEN the crm text language is returned', () => {
      expect(CRMTextLanguage.mapFromSARAS(SARASTextLanguage.ENGLISH)).toEqual(CRMTextLanguages.ENGLISH);
      expect(CRMTextLanguage.mapFromSARAS(SARASTextLanguage.WELSH)).toEqual(CRMTextLanguages.WELSH);
      expect(CRMTextLanguage.mapFromSARAS(undefined)).toBeUndefined();
      expect(() => CRMTextLanguage.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARAS Text Language - value 99'));
    });
  });
});
