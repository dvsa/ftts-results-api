export enum CRMSectionType {
  MCQ_TEST_RESULT = 1,
  HPT_TEST_RESULT = 2,
  TRIAL_TEST = 3,
  SURVEY_TEST = 4,
}

export const getSectionTypeLabel = (sectionType: CRMSectionType): string => {
  switch (sectionType) {
    case CRMSectionType.MCQ_TEST_RESULT:
      return 'MCQTestResult';
    case CRMSectionType.HPT_TEST_RESULT:
      return 'HPTTestResult';
    case CRMSectionType.TRIAL_TEST:
      return 'TrialTest';
    case CRMSectionType.SURVEY_TEST:
      return 'SurveyTest';
    default:
      throw Error('Unknown Section Type - no label found');
  }
};
