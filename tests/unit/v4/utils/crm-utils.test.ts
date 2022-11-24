import { CRMBookingProduct } from '../../../../src/shared/crm/booking-product/interfaces';
import { getOwnerIdBind } from '../../../../src/v4/utils/crm-utils';

describe('CRM Utils', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Get owner id bind', () => {
    test('Candidate bookings return owner id as system user', () => {
      const candidateBookingProduct: CRMBookingProduct = {
        ftts_bookingproductid: 'mockBookingProduct',
        _ownerid_value: 'mockOwnerId',
        _owninguser_value: 'mockOwnerId',
        ftts_reference: 'mockRef',
      };

      const value = getOwnerIdBind(candidateBookingProduct);

      expect(value).toBe('/systemusers(mockOwnerId)');
    });

    test('IHTTC bookings return owner id as a team', () => {
      const ihttcBookingProduct: CRMBookingProduct = {
        ftts_bookingproductid: 'mockBookingProduct',
        _ownerid_value: 'mockOwnerId',
        _owningteam_value: 'mockOwnerId',
        ftts_reference: 'mockRef',
      };

      const value = getOwnerIdBind(ihttcBookingProduct);

      expect(value).toBe('/teams(mockOwnerId)');
    });

    test('empty owning team & user throws error', () => {
      const bookingProduct: CRMBookingProduct = {
        ftts_bookingproductid: 'mockBookingProduct',
        _ownerid_value: 'mockOwnerId',
        _owningteam_value: undefined,
        _owninguser_value: undefined,
        ftts_reference: 'mockRef',
      };

      expect(() => getOwnerIdBind(bookingProduct))
        .toThrow(new Error(
          // eslint-disable-next-line no-underscore-dangle
          `crm-utils::getOwnerIdBind: Booking Product owner id: ${bookingProduct._ownerid_value} does not match the owning team (undefined) or user (undefined)`,
        ));
    });
  });
});
