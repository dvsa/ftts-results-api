import { ServiceBusReceivedMessage } from '@azure/service-bus';
import { SARASResultBody } from '../../shared/interfaces';

export interface BusinessIdentifiers {
  appointmentId?: string;
  candidateId?: string;
  reference?: string;
  context_id?: string;
  trace_id?: string;
}

export interface SARASResultQueueRecord extends SARASResultBody {
  trace_id?: string;
  context_id?: string;
  reference?: string;
  noOfArrivalQueueRetries?: number;
  sentToCrmAt?: string;
  AppointmentId?: string;
  bookingProductId?: string;
}

export interface QueueRecordServiceBusMessage extends ServiceBusReceivedMessage {
  body: SARASResultQueueRecord;
  applicationProperties?: {
    sentToCrmAt?: string;
  }
}

export interface Schema {
  $ref: string;
  $schema: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  definitions: object;
}
