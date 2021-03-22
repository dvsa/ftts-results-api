import { CRMItemType, CRMItemTypes } from '../../../../../src/v3/crm/test-item/item-type';
import { SARASItemType } from '../../../../../src/shared/interfaces';

describe('CRMItemType', () => {
  describe('mapFromSARAS', () => {
    test('GIVEN a saras item type WHEN called THEN the crm item type is returned', () => {
      expect(CRMItemType.mapFromSARAS(SARASItemType.HAZARD_PERCEPTION)).toEqual(CRMItemTypes.HAZARD_PERCEPTION);
      expect(CRMItemType.mapFromSARAS(SARASItemType.MULTIPLE_CHOICE_STATIC)).toEqual(CRMItemTypes.MULTIPLE_CHOICE);
      expect(CRMItemType.mapFromSARAS(SARASItemType.SURVEY)).toEqual(CRMItemTypes.SURVEY);
      expect(CRMItemType.mapFromSARAS(SARASItemType.TRIAL)).toEqual(CRMItemTypes.TRIAL);
      expect(CRMItemType.mapFromSARAS(undefined)).toEqual(undefined);
      expect(() => CRMItemType.mapFromSARAS(99)).toThrow(new Error('Error Mapping SARASItemType - value 99'));
    });
  });
  describe('getItemTypeLabel', () => {
    test('GIVEN a saras item type WHEN called THEN the correct label is returned', () => {
      expect(CRMItemType.getItemTypeLabel(SARASItemType.HAZARD_PERCEPTION)).toEqual('Hazard Perception');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.MULTIPLE_CHOICE_STATIC)).toEqual('Multiple Choice');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.SURVEY)).toEqual('Survey');
      expect(CRMItemType.getItemTypeLabel(SARASItemType.TRIAL)).toEqual('Trial');
      expect(() => CRMItemType.getItemTypeLabel(99)).toThrow(new Error('Unknown Item Type - no label found'));
    });
  });
});
