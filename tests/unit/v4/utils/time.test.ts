import MockDate from 'mockdate';
import {
  convertTimespanToSeconds, executionTimeoutNearlyReached, Timespan, Seconds,
} from '../../../../src/v4/utils/time';

describe('Time utils', () => {
  describe('convertTimespanToSeconds', () => {
    const testCases: Array<[Timespan, Seconds]> = [
      ['00:10:00', 600],
      ['02:15:00', 8100],
      ['00:00:30', 30],
      ['01:05:00', 3900],
      ['10:30:30', 37830],
    ];

    test.each(testCases)('converts timespan string \'%s\' to number of seconds %d', (input, expectedResult) => {
      const result = convertTimespanToSeconds(input);

      expect(result).toBe(expectedResult);
    });
  });

  describe('executionTimeoutNearlyReached', () => {
    const mockStartDateTime = new Date('2021-08-27T09:00:00');
    const mockTimeout: Seconds = 5 * 60;
    const mockTimeoutBuffer: Seconds = 30;

    afterEach(() => MockDate.reset());

    test('returns false when elapsed time has not yet reached the given timeout buffer', () => {
      MockDate.set('2021-08-27T09:04:28');

      const result = executionTimeoutNearlyReached(mockStartDateTime, mockTimeout, mockTimeoutBuffer);

      expect(result).toBe(false);
    });

    test('returns true when elapsed time is within the given timeout buffer', () => {
      MockDate.set('2021-08-27T09:04:33');

      const result = executionTimeoutNearlyReached(mockStartDateTime, mockTimeout, mockTimeoutBuffer);

      expect(result).toBe(true);
    });
  });
});
