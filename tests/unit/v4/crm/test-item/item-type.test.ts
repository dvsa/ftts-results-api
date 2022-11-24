import { CRMItemType, CRMItemTypes } from '../../../../../src/v4/crm/test-item/item-type';
import { SARASItemType } from '../../../../../src/shared/interfaces';

describe('CRMItemType', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras item type WHEN called THEN the crm item type is returned', () => {
      expect(CRMItemType.mapFromSARAS(SARASItemType.HAZARD_PERCEPTION)).toEqual(CRMItemTypes.HAZARD_PERCEPTION);
      expect(CRMItemType.mapFromSARAS(SARASItemType.MULTIPLE_CHOICE_STATIC)).toEqual(CRMItemTypes.MULTIPLE_CHOICE);
      expect(CRMItemType.mapFromSARAS(SARASItemType.SURVEY)).toEqual(CRMItemTypes.SURVEY);
      expect(CRMItemType.mapFromSARAS(SARASItemType.TRIAL)).toEqual(CRMItemTypes.TRIAL);
      expect(CRMItemType.mapFromSARAS(undefined)).toBeUndefined();
      expect(() => CRMItemType.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASItemType - value 99'));
    });
  });

  describe('getItemTypeLabel', () => {
    test('GIVEN a saras item type WHEN called THEN the correct label is returned', () => {
      expect(CRMItemType.getItemTypeLabel(SARASItemType.HAZARD_PERCEPTION)).toBe('Hazard Perception');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.MULTIPLE_CHOICE_STATIC)).toBe('Multiple Choice');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.SURVEY)).toBe('Survey');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.TRIAL)).toBe('Trial');
      expect(() => CRMItemType.getItemTypeLabel(99)).toThrow(new Error('Unknown Item Type - no label found'));
    });
  });
});
