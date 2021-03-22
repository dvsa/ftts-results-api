import { CRMSectionType, getSectionTypeLabel } from '../../../../../src/v3/crm/test-section/section-type';

describe('SectionType', () => {
  describe('getSectionTypeLabel', () => {
    test('GIVEN a section type WHEN called THEN the title\'s string representation is returned', () => {
      expect(getSectionTypeLabel(CRMSectionType.MCQ_TEST_RESULT)).toEqual('MCQTestResult');
      expect(getSectionTypeLabel(CRMSectionType.HPT_TEST_RESULT)).toEqual('HPTTestResult');
      expect(getSectionTypeLabel(CRMSectionType.TRIAL_TEST)).toEqual('TrialTest');
      expect(getSectionTypeLabel(CRMSectionType.SURVEY_TEST)).toEqual('SurveyTest');
      expect(() => getSectionTypeLabel(99)).toThrow(new Error('Unknown Section Type - no label found'));
    });
  });
});
