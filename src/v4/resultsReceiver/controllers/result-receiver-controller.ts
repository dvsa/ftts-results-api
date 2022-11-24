import { Context } from '@azure/functions';
import { v4 } from 'uuid';
import { SARASResultQueueRecord, Schema } from '../../interfaces';
import {
  ResultResponse,
  ValidationError,
  respond,
  respondInternalError,
  SARASResultBody,
} from '../../../shared/interfaces';
import { BusinessTelemetryEvent, logger } from '../../../shared/utils/logger';
import { ResultValidator } from '../../../shared/utils/result-validator';
import { QueueService, StorageService } from '../../services';
import { getSarasIdentifiers } from '../../../shared/utils/identifiers';

class ResultReceiverController {
  public async receiveResult(context: Context, schema: Schema, mapToV4Record?: (record: SARASResultBody) => void): Promise<ResultResponse> {
    try {
      logger.event(BusinessTelemetryEvent.RES_RECEIVER_RECEIVED, 'ResultReceiverController::receiveResult: Processing new result', {
        appointmentId: context.req?.params.appointmentId,
        ...getSarasIdentifiers(context?.req?.body as SARASResultBody),
      });
      logger.debug('ResultReceiverController::receiveResult: raw request payload', {
        payload: JSON.stringify(context?.req?.body),
      });
      if (context.req && ResultValidator.validateResultRequest(context.req.body as SARASResultBody, schema)) {
        if (!context.req.params.appointmentId) {
          const validationError = new ValidationError('ResultReceiverController::receiveResult: AppointmentId is required as a URL param');
          logger.error(validationError, 'ResultReceiverController::receiveResult: There was an error with the request, appointment id is needed', {
            ...context.req.params,
            message: validationError.message,
          });
          throw validationError;
        }

        const resultRecord = context.req.body as SARASResultBody;
        if (mapToV4Record) {
          mapToV4Record(resultRecord);
        }
        await this.persistSignatureAndPhoto(resultRecord, context.req.params.appointmentId);

        const queueRecord: SARASResultQueueRecord = {
          ...resultRecord,
          trace_id: v4(),
          context_id: '',
          reference: v4(),
          noOfArrivalQueueRetries: 0,
          AppointmentId: context.req?.params.appointmentId,
        };
        logger.debug('ResultReceiverController::receiveResult: Sending result to arrival queue', {
          ...context.req.params,
          payload: queueRecord,
        });
        await QueueService.sendResultToArrivalQueue(queueRecord);

        return respond(200, 'Result received');
      }

      // awaiting on promise.reject doesn't seem to work
      // eslint-disable-next-line @typescript-eslint/return-await
      return Promise.reject(respondInternalError());
    } catch (error) {
      logger.error(error as Error, 'ResultReceiverController::receiveResult: Error when handling result payload', {
        message: (error as Error).message,
      });
      if (error instanceof ValidationError) {
        return Promise.reject(respond(400, (error as Error).message));
      }

      return Promise.reject(respond(500, (error as Error).message));
    }
  }

  private async persistSignatureAndPhoto(resultRecord: SARASResultBody, appointmentId: string): Promise<void> {
    const uuid = `${v4()}`;
    if (resultRecord.Admission?.CandidateSignature) {
      const filename = `${appointmentId}-candidatesignature-${uuid}.jpeg`;
      await StorageService.persistImage(resultRecord.Admission.CandidateSignature, 'CandidateSignature', filename);
      resultRecord.Admission.CandidateSignature = filename;
    }
    if (resultRecord.Admission?.CandidatePhoto) {
      const filename = `${appointmentId}-candidatephoto-${uuid}.jpeg`;
      await StorageService.persistImage(resultRecord.Admission.CandidatePhoto, 'CandidatePhoto', filename);
      resultRecord.Admission.CandidatePhoto = filename;
    }
    if (resultRecord.AccommodationAssistant?.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const assistant of resultRecord.AccommodationAssistant) {
        if (assistant.AssistantSignature) {
          const filename = `${appointmentId}-assistantSignature-${uuid}-${v4()}.jpeg`;
          // eslint-disable-next-line no-await-in-loop
          await StorageService.persistImage(assistant.AssistantSignature, 'AssistantSignature', filename);
          assistant.AssistantSignature = filename;
        }
      }
    }
  }
}

export default ResultReceiverController;
