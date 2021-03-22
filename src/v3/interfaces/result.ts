import { SARASResultBody } from '../../shared/interfaces';

export interface QueueMessage {
  body: QueueRecord;
}

export interface QueueRecord extends SARASResultBody {
  trace_id?: string;
  context_id?: string;
  reference?: string;
  noOfArrivalQueueRetries?: number;
  sentToCrmAt?: string;
  AppointmentId?: string;
  bookingProductId?: string;
}

export interface Schema {
  $ref: string;
  $schema: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  definitions: object;
}
