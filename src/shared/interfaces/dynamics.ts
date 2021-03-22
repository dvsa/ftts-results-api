import { CRMRemit } from '../../v3/crm/account/remit';

export interface DynamicsBookingProductResponse {
  ftts_bookingproductid: string | PromiseLike<string>;
  ftts_reference: string | PromiseLike<string>;
  _ownerid_value: string | PromiseLike<string>;
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
