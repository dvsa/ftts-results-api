import { CRMRemit } from '../crm/account/remit';
import { CandidateId, CRMBooking, CRMTestCentre } from '../crm/booking-product/interfaces';

export interface DynamicsBookingProductResponse {
  ftts_bookingproductid: string | PromiseLike<string>;
  ftts_reference: string | PromiseLike<string>;
  _ownerid_value: string | PromiseLike<string>;
  _owninguser_value?: string | PromiseLike<string>;
  _owningteam_value?: string | PromiseLike<string>;
  _ftts_bookingid_value: string | PromiseLike<string>;
  _ftts_productid_value: string | PromiseLike<string>;
  ftts_ihttcid: CRMTestCentre | PromiseLike<CRMTestCentre>;
  ftts_bookingid: CRMBooking;
  ftts_CandidateId: CandidateId;
}

export interface DynamicsBookingProductIdResponse {
  ftts_bookingproductid: string | PromiseLike<string>;
}

export interface DynamicsProductResponse {
  productid: string | PromiseLike<string>;
}

export interface DynamicsRemitResponse {
  ftts_remit: CRMRemit | undefined;
}
