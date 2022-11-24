import Remit, { Organisation } from '../../shared/crm/account/remit';
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';
import { SARASResultBody } from '../../shared/interfaces';
import { SARASResultQueueRecord } from './result';

interface Tracing {
  trace_id?: string;
  context_id?: string;
  reference?: string;
  AppointmentId?: string;
  bookingProductId?: string;
}

export interface DigitalResults {
  email: string;
  target: string;
  results: SARASResultBody;
  tracing: Tracing;
}

export const toDigitalResults = (sarasResultQueueRecord: SARASResultQueueRecord, bookingProduct?: CRMBookingProduct): DigitalResults => {
  if (!bookingProduct) {
    throw new Error('toDigitalResults:: Booking Product not set');
  }

  if (!bookingProduct.ftts_CandidateId?.emailaddress1) {
    throw new Error('toDigitalResults:: Email address not set');
  }

  const tempQueueRecord: SARASResultQueueRecord = { ...sarasResultQueueRecord };

  // The following fields are not required in Digital Results Processor
  delete tempQueueRecord.trace_id;
  delete tempQueueRecord.context_id;
  delete tempQueueRecord.reference;
  delete tempQueueRecord.noOfArrivalQueueRetries;
  delete tempQueueRecord.sentToCrmAt;
  delete tempQueueRecord.AppointmentId;
  delete tempQueueRecord.bookingProductId;

  return {
    email: bookingProduct.ftts_CandidateId.emailaddress1,
    target: Remit.mapToOrganisation(bookingProduct.ftts_ihttcid.ftts_remit) === Organisation.DVA ? 'ni' : 'gb',
    results: truncateImageData(tempQueueRecord),
    tracing: {
      trace_id: sarasResultQueueRecord.trace_id,
      context_id: sarasResultQueueRecord.context_id,
      reference: sarasResultQueueRecord.reference,
      AppointmentId: sarasResultQueueRecord.AppointmentId,
      bookingProductId: sarasResultQueueRecord.bookingProductId,
    },
  };
};

const truncateImageData = (sarasResultQueueRecord: SARASResultQueueRecord): SARASResultQueueRecord => {
  const truncatedObject = { ...sarasResultQueueRecord };
  const TRUNCATED_PLACEHOLDER = 'truncated';
  if (truncatedObject.Admission?.CandidatePhoto) {
    truncatedObject.Admission.CandidatePhoto = TRUNCATED_PLACEHOLDER;
  }
  if (truncatedObject.Admission?.CandidateSignature) {
    truncatedObject.Admission.CandidateSignature = TRUNCATED_PLACEHOLDER;
  }
  if (truncatedObject.AccommodationAssistant?.length) {
    for (const assistant of truncatedObject.AccommodationAssistant) {
      if (assistant.AssistantSignature) {
        assistant.AssistantSignature = TRUNCATED_PLACEHOLDER;
      }
    }
  }
  return truncatedObject;
};

export class DigitalResultsError extends Error { }
