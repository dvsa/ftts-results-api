import { Context } from '@azure/functions';
import { Logger as AzureLogger, getOperationId } from '@dvsa/azure-logger';
import { QueueRecord } from '../../v3/interfaces';

export class Logger extends AzureLogger {
  constructor() {
    super('FTTS', 'results-api');
  }

  logEvent(
    telemetryEvent: BusinessTelemetryEvent,
    message?: string,
    properties?: { [key: string]: string },
  ): void {
    super.event(
      telemetryEvent,
      message,
      { ...properties },
    );
  }

  getOperationId(context: Context): string {
    return getOperationId(context);
  }
}

export enum BusinessTelemetryEvent {
  RES_API_ENQUEUE_ERROR = 'RES_API_ENQUEUE_ERROR',
  RES_API_BINARY_DATA_OFFLOAD_ERROR = 'RES_API_BINARY_DATA_OFFLOAD_ERROR',
  RES_CONSUMER_PAYMENT_EVENT_ERROR = 'RES_CONSUMER_PAYMENT_EVENT_ERROR',
  RES_CONSUMER_CDS_BAD_REQUEST = 'RES_CONSUMER_CDS_BAD_REQUEST',
  RES_CONSUMER_CDS_CONNECTIVITY_ISSUE = 'RES_CONSUMER_CDS_CONNECTIVITY_ISSUE',
  RES_CONSUMER_CDS_NOT_FOUND = 'RES_CONSUMER_CDS_NOT_FOUND',
  RES_CONSUMER_CDS_INTERNAL_ERROR = 'RES_CONSUMER_CDS_INTERNAL_ERROR',
}

export const logger = new Logger();

export const getIdentifiers = (queueRecord: QueueRecord): string => JSON.stringify({
  appointmentId: queueRecord?.AppointmentId,
  candidateId: queueRecord?.Candidate?.CandidateID,
  reference: queueRecord?.reference,
  context_id: queueRecord?.context_id,
  trace_id: queueRecord?.trace_id,
});
