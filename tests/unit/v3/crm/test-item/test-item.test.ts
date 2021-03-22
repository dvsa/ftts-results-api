import { SARASItemType, SARASHPTItemResponse } from '../../../../../src/shared/interfaces';
import { CRMTestItem } from '../../../../../src/v3/crm/test-item/test-item';
import { CRMItemTypes } from '../../../../../src/v3/crm/test-item/item-type';

describe('CRMTestItem', () => {
  describe('new CRMTestItem', () => {
    test('GIVEN a SARASItem WHEN called THEN a new CRMTestItem is created', () => {
      const item: SARASHPTItemResponse = {
        Code: 'test-code',
        FrameRate: 100,
        InappropriateKeyingsInvoked: 10,
        Order: 2,
        Score: 78.2,
        Topic: 'test-topic',
        Type: SARASItemType.SURVEY,
        UserResponses: ['1', '2', '3'],
        Version: 1.234,
      };

      const expectedItem: CRMTestItem = new CRMTestItem(item, '1234', 'test-owner-id');

      expect(expectedItem.ftts_code).toEqual(item.Code);
      expect(expectedItem.ftts_framerate).toEqual(item.FrameRate);
      expect(expectedItem.ftts_inappropriatekeyingsinvoked).toEqual(item.InappropriateKeyingsInvoked);
      expect(expectedItem.ftts_name).toEqual('Survey - 2 - test-code');
      expect(expectedItem.ftts_order).toEqual(item.Order);
      expect(expectedItem.ftts_score).toEqual(item.Score);
      expect(expectedItem.ftts_topic).toEqual(item.Topic);
      expect(expectedItem.ftts_type).toEqual(CRMItemTypes.SURVEY);
      expect(expectedItem.ftts_userresponses).toEqual('1,2,3');
      expect(expectedItem.ftts_version).toEqual(item.Version);
      expect(expectedItem['ownerid@odata.bind']).toEqual('/teams(test-owner-id)');
    });
  });
});
