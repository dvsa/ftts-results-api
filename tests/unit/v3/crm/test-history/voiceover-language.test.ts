import { CRMVoiceoverLanguage, CRMVoiceoverLanguages } from '../../../../../src/v3/crm/test-history/voiceover-language';
import { SARASVoiceOverLanguage } from '../../../../../src/shared/interfaces';

describe('CRMVoiceoverLanguage', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras voiceover language WHEN called THEN the crm voiceover language is returned', () => {
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.ENGLISH)).toEqual(CRMVoiceoverLanguages.ENGLISH);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.WELSH)).toEqual(CRMVoiceoverLanguages.WELSH);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.ARABIC)).toEqual(CRMVoiceoverLanguages.ARABIC);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.FARSI)).toEqual(CRMVoiceoverLanguages.FARSI);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.CANTONESE)).toEqual(CRMVoiceoverLanguages.CANTONESE);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.TURKISH)).toEqual(CRMVoiceoverLanguages.TURKISH);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.POLISH)).toEqual(CRMVoiceoverLanguages.POLISH);
      expect(CRMVoiceoverLanguage.mapFromSARAS(SARASVoiceOverLanguage.PORTUGUESE)).toEqual(CRMVoiceoverLanguages.PORTUGUESE);
      expect(CRMVoiceoverLanguage.mapFromSARAS(undefined)).toEqual(undefined);
      expect(() => CRMVoiceoverLanguage.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASVoiceOverLanguage- value 99'));
    });
  });
});
