import { CRMRemit } from '../account/remit';

export interface CRMBookingProduct {
  ftts_bookingproductid: string;
  ftts_reference: string;
  _ownerid_value: string;
  _owninguser_value?: string;
  _owningteam_value?: string;
  _ftts_bookingid_value?: string;
  _ftts_productid_value: string;
  ftts_ihttcid: CRMTestCentre;
  ftts_bookingid: CRMBooking;
  ftts_CandidateId?: CandidateId;
}

export interface CRMBooking {
  ftts_owedcompbookingassigned: string | null; // ISO datetime
  ftts_owedcompbookingrecognised: string | null; // ISO datetime
  ftts_origin: CRMOrigin;
}

export interface CRMTestCentre {
  accountid: string;
  ftts_remit: CRMRemit;
}

export interface CandidateId {
  emailaddress1: string;
  contactid?: string;
}

export enum CRMOrigin {
  CitizenPortal = 1,
  CustomerServiceCentre = 2,
  IHTTCPortal = 3,
  TrainerBookerPortal = 4,
}
