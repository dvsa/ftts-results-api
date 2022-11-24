import { isOwedCompensationBooking } from '../../../../../src/shared/crm/booking-product/booking-product';
import { mockCompensationBookingProduct, mockBookingProduct } from '../../../../mocks/crm-records';

describe('isOwedCompensationBooking', () => {
  test('returns true for a compensation booking', () => {
    expect(isOwedCompensationBooking(mockCompensationBookingProduct())).toBe(true);
  });

  test('returns false for a non compensation booking', () => {
    expect(isOwedCompensationBooking(mockBookingProduct())).toBe(false);
  });
});
