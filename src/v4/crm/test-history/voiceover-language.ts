/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable import/export */
import { SARASVoiceOverLanguage } from '../../../shared/interfaces';

export enum CRMVoiceoverLanguages {
  ALBANIAN = 675030000,
  ARABIC = 675030001,
  BENGALI = 675030002,
  CANTONESE = 675030003,
  DARI = 675030004,
  ENGLISH = 675030005,
  FARSI = 675030006,
  GUJARATI = 675030007,
  HINDI = 675030008,
  KASHMIRI = 675030009,
  KURDISH = 675030010,
  MIRPURI = 675030011,
  NONE = 675030020,
  POLISH = 675030012,
  PORTUGUESE = 675030013,
  PUNJABI = 675030014,
  PUSHTO = 675030015,
  SPANISH = 675030016,
  TAMIL = 675030017,
  TURKISH = 675030018,
  URDU = 675030019,
  WELSH = 675030021,
}

export class CRMVoiceoverLanguage {
  public static mapFromSARAS(language: SARASVoiceOverLanguage | undefined): CRMVoiceoverLanguages | undefined {
    switch (language) {
      case undefined:
        return undefined;
      case SARASVoiceOverLanguage.ENGLISH:
        return CRMVoiceoverLanguages.ENGLISH;
      case SARASVoiceOverLanguage.WELSH:
        return CRMVoiceoverLanguages.WELSH;
      case SARASVoiceOverLanguage.ARABIC:
        return CRMVoiceoverLanguages.ARABIC;
      case SARASVoiceOverLanguage.FARSI:
        return CRMVoiceoverLanguages.FARSI;
      case SARASVoiceOverLanguage.CANTONESE:
        return CRMVoiceoverLanguages.CANTONESE;
      case SARASVoiceOverLanguage.TURKISH:
        return CRMVoiceoverLanguages.TURKISH;
      case SARASVoiceOverLanguage.POLISH:
        return CRMVoiceoverLanguages.POLISH;
      case SARASVoiceOverLanguage.PORTUGUESE:
        return CRMVoiceoverLanguages.PORTUGUESE;
      default:
        throw new Error(`Error Mapping SARASVoiceOverLanguage- value ${language as SARASVoiceOverLanguage}`);
    }
  }
}
