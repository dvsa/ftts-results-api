import { Context } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { QueueRecord, Schema } from '../../interfaces';
import {
  ResultResponse,
  ValidationError,
  respond,
  respondInternalError,
  SARASResultBody,
} from '../../../shared/interfaces';
import { logger } from '../../../shared/utils/logger';
import { ResultValidator } from '../../../shared/utils/result-validator';
import { QueueService, StorageService } from '../../services';

class ResultReceiverController {
  public async receiveResult(context: Context, schema: Schema, mapToV3Record?: (record: SARASResultBody) => void): Promise<ResultResponse> {
    try {
      if (context.req && ResultValidator.validateResultRequest(context.req.body, schema)) {
        // TODO FTT-5417 - Needs to be removed as it will log out sensitive personal information in prod
        logger.debug('ResultReceiverController::receiveResult raw request payload', {
          payload: JSON.stringify(context.req.body),
          context,
        });

        if (context.req.params.appointmentId) {
          const resultRecord = context.req.body as SARASResultBody;
          if (mapToV3Record) {
            mapToV3Record(resultRecord);
          }

          if (resultRecord.Admission?.CandidateSignature) {
            const filename: string = await StorageService.persistImage(context, resultRecord.Admission.CandidateSignature);
            resultRecord.Admission.CandidateSignature = filename;
          }
          if (resultRecord.Admission?.CandidatePhoto) {
            const filename: string = await StorageService.persistImage(context, resultRecord.Admission.CandidatePhoto);
            resultRecord.Admission.CandidatePhoto = filename;
          }
          if (resultRecord.AccommodationAssistant?.length) {
            for (let i = 0, j = resultRecord.AccommodationAssistant.length; i < j; i++) {
              // crazy hack to get around eslint object sink rule
              const assistant = resultRecord.AccommodationAssistant[parseInt(`${i}`, 10)];
              if (assistant.AssistantSignature) {
                // eslint-disable-next-line no-await-in-loop
                assistant.AssistantSignature = await StorageService.persistImage(context, assistant.AssistantSignature || '');
              }
            }
          }

          const queueRecord: QueueRecord = {
            ...resultRecord,
            trace_id: logger.getOperationId(context) || uuidv4(),
            context_id: context.traceContext.traceparent || '',
            reference: logger.getOperationId(context) || uuidv4(),
            noOfArrivalQueueRetries: 0,
            AppointmentId: context.req?.params.appointmentId,
          };
          await QueueService.sendResultToArrivalQueue(context, queueRecord);

          return respond(200, 'Result received');
        }

        throw new ValidationError('AppointmentId is required as a URL param');
      }

      return Promise.reject(respondInternalError());
    } catch (error) {
      if (error instanceof ValidationError) {
        return Promise.reject(respond(400, (error as Error).message));
      }

      return Promise.reject(respond(500, (error as Error).message));
    }
  }
}

export default ResultReceiverController;
