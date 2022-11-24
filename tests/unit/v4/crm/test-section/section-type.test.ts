import { CRMSectionType, getSectionTypeLabel } from '../../../../../src/v4/crm/test-section/section-type';

describe('SectionType', () => {
  describe('getSectionTypeLabel', () => {
    test('GIVEN a section type WHEN called THEN the title\'s string representation is returned', () => {
      expect(getSectionTypeLabel(CRMSectionType.MCQ_TEST_RESULT)).toBe('MCQTestResult');
      expect(getSectionTypeLabel(CRMSectionType.HPT_TEST_RESULT)).toBe('HPTTestResult');
      expect(getSectionTypeLabel(CRMSectionType.TRIAL_TEST)).toBe('TrialTest');
      expect(getSectionTypeLabel(CRMSectionType.SURVEY_TEST)).toBe('SurveyTest');
      expect(() => getSectionTypeLabel(99)).toThrow(new Error('Unknown Section Type - no label found'));
    });
  });
});
