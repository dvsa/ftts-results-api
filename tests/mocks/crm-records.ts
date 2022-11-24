import { CRMRemit } from '../../src/shared/crm/account/remit';
import { CRMBookingProduct } from '../../src/shared/crm/booking-product/interfaces';

export const mockCompensationBookingProduct = (): CRMBookingProduct => ({
  ftts_bookingproductid: 'mockBookingProductId',
  ftts_reference: 'REF-001',
  _ownerid_value: '87559',
  _owninguser_value: '54353',
  _owningteam_value: '87559',
  _ftts_bookingid_value: 'mockBookingId',
  _ftts_productid_value: 'mockProductId',
  ftts_CandidateId: {
    emailaddress1: 'mock@email.com',
  },
  ftts_ihttcid: {
    accountid: 'testCentreId',
    ftts_remit: CRMRemit.DVSA_ENGLAND,
  },
  ftts_bookingid: {
    ftts_owedcompbookingassigned: '2021-09-06T10:21:12.889Z',
    ftts_owedcompbookingrecognised: null,
    ftts_origin: 1,
  },
});

export const mockBookingProduct = (): CRMBookingProduct => ({
  ftts_bookingproductid: 'mockBookingProductId',
  ftts_reference: 'REF-001',
  _ownerid_value: '87559',
  _owninguser_value: '54353',
  _owningteam_value: '87559',
  _ftts_bookingid_value: 'mockBookingId',
  _ftts_productid_value: 'mockProductId',
  ftts_CandidateId: {
    emailaddress1: 'mock@email.com',
  },
  ftts_ihttcid: {
    accountid: 'testCentreId',
    ftts_remit: CRMRemit.DVSA_ENGLAND,
  },
  ftts_bookingid: {
    ftts_owedcompbookingassigned: null,
    ftts_owedcompbookingrecognised: null,
    ftts_origin: 1,
  },
});
