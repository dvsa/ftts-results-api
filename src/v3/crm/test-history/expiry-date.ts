import dayjs from 'dayjs';
import * as isLeapYear from 'dayjs/plugin/isLeapYear';
import { SARASStatus } from '../../../shared/interfaces';
import { Organisation } from '../account/remit';

export default class ExpiryDate {
  private static DATE_FORMAT = 'YYYY-MM-DD';

  public static calculateExpiryDate(testDate: string| undefined, testStatus: SARASStatus, org: Organisation| undefined): string | undefined {
    if (testStatus !== SARASStatus.PASS || !testDate) {
      return undefined;
    }

    switch (org) {
      case Organisation.DVSA:
        return ExpiryDate.calculateDVSAExpiryDate(testDate);
      case Organisation.DVA:
        return ExpiryDate.calculateDVAExpiryDate(testDate);
      default:
        return undefined;
    }
  }

  private static calculateDVSAExpiryDate(testDate: string): string {
    dayjs.extend(isLeapYear.default);
    const date = dayjs(testDate);

    // Special Case for tests which are on 29th Feb
    if (date.isLeapYear() && date.format('MM-DD') === '02-29') {
      return date.add(2, 'year').format(ExpiryDate.DATE_FORMAT);
    }
    // 729 Days = 1 year and 364 days (2 years - 1 day)
    const expiryDate = date.add(729, 'day');

    // Add an extra day if certificate expires on a leap year and test date was 1st March
    if (expiryDate.isLeapYear() && date.format('MM-DD') === '03-01') {
      return expiryDate.add(1, 'day').format(ExpiryDate.DATE_FORMAT);
    }

    return expiryDate.format(ExpiryDate.DATE_FORMAT);
  }

  private static calculateDVAExpiryDate(testDate: string): string {
    return dayjs(testDate).add(2, 'year').format(ExpiryDate.DATE_FORMAT);
  }
}
