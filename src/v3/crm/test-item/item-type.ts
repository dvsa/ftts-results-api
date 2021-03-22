import { SARASItemType } from '../../../shared/interfaces';

export enum CRMItemTypes {
  MULTIPLE_CHOICE = 1,
  HAZARD_PERCEPTION = 2,
  TRIAL = 3,
  SURVEY = 4
}

export class CRMItemType {
  public static mapFromSARAS(type: SARASItemType | undefined): CRMItemTypes | undefined {
    switch (type) {
      case undefined:
        return undefined;
      case SARASItemType.MULTIPLE_CHOICE_STATIC:
        return CRMItemTypes.MULTIPLE_CHOICE;
      case SARASItemType.HAZARD_PERCEPTION:
        return CRMItemTypes.HAZARD_PERCEPTION;
      case SARASItemType.TRIAL:
        return CRMItemTypes.TRIAL;
      case SARASItemType.SURVEY:
        return CRMItemTypes.SURVEY;
      default:
        throw new Error(`Error Mapping SARASItemType - value ${type as SARASItemType}`);
    }
  }

  public static getItemTypeLabel = (type: SARASItemType | undefined): string => {
    switch (type) {
      case SARASItemType.MULTIPLE_CHOICE_STATIC:
        return 'Multiple Choice';
      case SARASItemType.HAZARD_PERCEPTION:
        return 'Hazard Perception';
      case SARASItemType.SURVEY:
        return 'Survey';
      case SARASItemType.TRIAL:
        return 'Trial';
      default:
        throw Error('Unknown Item Type - no label found');
    }
  };
}
