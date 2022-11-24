import { CRMTestAccommodation, CRMTestAccommodations } from '../../../../../src/v4/crm/common/test-accommodation';
import { SARASAccommodationType } from '../../../../../src/shared/interfaces';

describe('CRMTestAccommodation', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras accommodation WHEN called THEN the crm accommodation type is returned', () => {
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.AT_HOME_TESTING)).toEqual(CRMTestAccommodations.AT_HOME_TEST);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.BSL)).toEqual(CRMTestAccommodations.BSL);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.BSL_TRANSLATOR)).toEqual(CRMTestAccommodations.BSL_TRANSLATOR);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.EXTRA_LENGTH)).toEqual(CRMTestAccommodations.EXTRA_LENGTH);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.LANGUAGE_TRANSLATOR)).toEqual(CRMTestAccommodations.LANGUAGE_TRANSLATOR);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.LIP_SPEAKER)).toEqual(CRMTestAccommodations.LIP_SPEAKER);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.LISTENING_AID)).toEqual(CRMTestAccommodations.LISTENING_AID);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.OLM)).toEqual(CRMTestAccommodations.OLM_TEST);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.PAUSE_HPT)).toEqual(CRMTestAccommodations.PAUSE_HPT);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.READER)).toEqual(CRMTestAccommodations.READER);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.RECORDER)).toEqual(CRMTestAccommodations.RECORDER);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.SEPARATE_ROOM)).toEqual(CRMTestAccommodations.SEPARATE_ROOM);
      expect(CRMTestAccommodation.mapFromSARAS(SARASAccommodationType.VOICEOVER_LANGUAGE)).toEqual(CRMTestAccommodations.VOICEOVER_LANGUAGE);
      expect(CRMTestAccommodation.mapFromSARAS(undefined)).toBeUndefined();
      expect(() => CRMTestAccommodation.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASAccommodationType - value 99'));
    });
  });
  describe('mapFromSARASArray', () => {
    test('GIVEN undefined WHEN called THEN undefined is returned', () => {
      expect(CRMTestAccommodation.mapFromSARASArray(undefined)).toBeUndefined();
    });
    test('GIVEN an array of saras accomodation types WHEN called THE a string containing the crm accommodation types is returned', () => {
      const sarasTypes = [
        SARASAccommodationType.BSL,
        SARASAccommodationType.EXTRA_LENGTH,
      ];
      const expectedTypes = [
        CRMTestAccommodations.BSL,
        CRMTestAccommodations.EXTRA_LENGTH,
      ];
      expect(CRMTestAccommodation.mapFromSARASArray(sarasTypes)).toEqual(expectedTypes.toString());
    });
  });
});
