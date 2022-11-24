import { SARASAccommodationType } from '../../../shared/interfaces';

export enum CRMTestAccommodations {
  EXTRA_LENGTH = 1,
  VOICEOVER_LANGUAGE = 2,
  BSL = 3,
  PAUSE_HPT = 4,
  OLM_TEST = 5,
  READER = 6,
  RECORDER = 7,
  BSL_TRANSLATOR = 8,
  LIP_SPEAKER = 9,
  LISTENING_AID = 10,
  SEPARATE_ROOM = 11,
  AT_HOME_TEST = 12,
  LANGUAGE_TRANSLATOR = 13,
}

export class CRMTestAccommodation {
  public static mapFromSARAS(type: SARASAccommodationType | undefined): CRMTestAccommodations | undefined {
    switch (type) {
      case undefined:
        return undefined;
      case SARASAccommodationType.EXTRA_LENGTH:
        return CRMTestAccommodations.EXTRA_LENGTH;
      case SARASAccommodationType.VOICEOVER_LANGUAGE:
        return CRMTestAccommodations.VOICEOVER_LANGUAGE;
      case SARASAccommodationType.BSL:
        return CRMTestAccommodations.BSL;
      case SARASAccommodationType.PAUSE_HPT:
        return CRMTestAccommodations.PAUSE_HPT;
      case SARASAccommodationType.OLM:
        return CRMTestAccommodations.OLM_TEST;
      case SARASAccommodationType.READER:
        return CRMTestAccommodations.READER;
      case SARASAccommodationType.RECORDER:
        return CRMTestAccommodations.RECORDER;
      case SARASAccommodationType.BSL_TRANSLATOR:
        return CRMTestAccommodations.BSL_TRANSLATOR;
      case SARASAccommodationType.LIP_SPEAKER:
        return CRMTestAccommodations.LIP_SPEAKER;
      case SARASAccommodationType.LISTENING_AID:
        return CRMTestAccommodations.LISTENING_AID;
      case SARASAccommodationType.SEPARATE_ROOM:
        return CRMTestAccommodations.SEPARATE_ROOM;
      case SARASAccommodationType.AT_HOME_TESTING:
        return CRMTestAccommodations.AT_HOME_TEST;
      case SARASAccommodationType.LANGUAGE_TRANSLATOR:
        return CRMTestAccommodations.LANGUAGE_TRANSLATOR;
      default:
        throw new Error(`Error Mapping SARASAccommodationType - value ${type as SARASAccommodationType}`);
    }
  }

  public static mapFromSARASArray(types: SARASAccommodationType[] | undefined): string | undefined {
    if (!types) {
      return undefined;
    }
    return types.map((type) => CRMTestAccommodation.mapFromSARAS(type)).toString();
  }
}
