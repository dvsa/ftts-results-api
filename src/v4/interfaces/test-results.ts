import { SARASResultQueueRecord } from '.';
import { SARASMCQTestResult, SARASHPTTestResult, SARASTrialTest, SARASSurveyTest } from '../../shared/interfaces';

export interface TestResults {
  testHistoryId: string,
  MCQTestResult?: SARASMCQTestResult,
  HPTTestResult?: SARASHPTTestResult,
  TrialTest?: SARASTrialTest,
  SurveyTest?: SARASSurveyTest
}

export const toTestResults = (sarasResultQueueRecord: SARASResultQueueRecord, testHistoryId: string): TestResults => {

  return {
    testHistoryId: testHistoryId,
    MCQTestResult: sarasResultQueueRecord.MCQTestResult,
    HPTTestResult: sarasResultQueueRecord.HPTTestResult,
    TrialTest: sarasResultQueueRecord.TrialTest,
    SurveyTest: sarasResultQueueRecord.SurveyTest,
  };
};

export class TestResultsError extends Error { }
