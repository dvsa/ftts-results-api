import { toTestResults } from './../../../../src/v4/interfaces/test-results';
import { queueRecord } from '../../../mocks/result-records';

const testHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';

describe('Test Results', () => {

  describe('toTestResult()', () => {
    test('should map a queue record and test history id to a test result', () => {
      const record = queueRecord();

      const testResults = toTestResults(record, testHistoryId);

      expect(testResults).toStrictEqual({
        testHistoryId: testHistoryId,
        MCQTestResult: record.MCQTestResult,
        HPTTestResult: record.HPTTestResult,
        TrialTest: record.TrialTest,
        SurveyTest: record.SurveyTest,
      });
    });
  });
});
