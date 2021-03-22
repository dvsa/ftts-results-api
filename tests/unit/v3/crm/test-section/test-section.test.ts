import { SARASHPTSection } from '../../../../../src/shared/interfaces';
import { CRMTestSection } from '../../../../../src/v3/crm/test-section/test-section';
import { CRMSectionType } from '../../../../../src/v3/crm/test-section/section-type';

describe('CRMTestSection', () => {
  describe('new CRMTestSection', () => {
    test('GIVEN a SARASSection WHEN called THEN a new CRMTestSection is created', () => {
      const section: SARASHPTSection = {
        Name: 'Road Signs',
        Order: 0,
        MaxScore: 10,
        TotalScore: 5,
        Percentage: 50,
        StartTime: '2020-07-24T23:00:00Z',
        EndTime: '2020-07-24T23:00:00Z',
      };
      const expectedItem: CRMTestSection = new CRMTestSection(section, 'test-history-id', 'test-owner-id', CRMSectionType.HPT_TEST_RESULT);

      expect(expectedItem.ftts_name).toEqual('HPTTestResult - 0 - Road Signs');
      expect(expectedItem.ftts_sectionname).toEqual(section.Name);
      expect(expectedItem.ftts_sectiontype).toEqual(CRMSectionType.HPT_TEST_RESULT.toString());
      expect(expectedItem.ftts_order).toEqual(section.Order);
      expect(expectedItem.ftts_maxscore).toEqual(section.MaxScore);
      expect(expectedItem.ftts_totalscore).toEqual(section.TotalScore);
      expect(expectedItem.ftts_percentage).toEqual(section.Percentage);
      expect(expectedItem.ftts_starttime).toEqual(section.StartTime);
      expect(expectedItem.ftts_endtime).toEqual(section.EndTime);
      expect(expectedItem['ownerid@odata.bind']).toEqual('/teams(test-owner-id)');
      expect(expectedItem['ftts_Testhistory@odata.bind']).toEqual('test-history-id');
    });
  });
});
