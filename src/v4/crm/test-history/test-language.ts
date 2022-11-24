import { SARASTextLanguage } from '../../../shared/interfaces';

export enum CRMTextLanguages {
  ENGLISH = 1,
  WELSH = 2,
}

export class CRMTextLanguage {
  public static mapFromSARAS(language: SARASTextLanguage | undefined): CRMTextLanguages | undefined {
    switch (language) {
      case undefined:
        return undefined;
      case SARASTextLanguage.ENGLISH:
        return CRMTextLanguages.ENGLISH;
      case SARASTextLanguage.WELSH:
        return CRMTextLanguages.WELSH;
      default:
        throw new Error(`Error Mapping SARAS Text Language - value ${language as SARASTextLanguage}`);
    }
  }
}
