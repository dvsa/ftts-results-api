import { SARASResultBody, ValidationError } from '../../shared/interfaces';
import { QueueRecord } from '../interfaces';
import { ResultValidator } from '../../shared/utils/result-validator';
import SARASResultBodySchema from '../schemas/SARASResultBodyV3.schema.json';

export class QueueRecordValidator {
  public static validateResultQueueRecord(record: QueueRecord): boolean {
    if (record && record instanceof Object) {
      if (record.trace_id) {
        if (record.AppointmentId) {
          const data: SARASResultBody = this.toSARASResultBody(record);
          return ResultValidator.validateResultRequest(data, SARASResultBodySchema);
        }

        throw new ValidationError('Validation Error - Record should have required property AppointmentId');
      }

      throw new ValidationError('Validation Error - Record should have required property trace_id');
    }

    throw new ValidationError('Validation Error - Record body is empty or not valid');
  }

  private static toSARASResultBody = (queueRecord: QueueRecord): SARASResultBody => {
    const record = JSON.parse(JSON.stringify(queueRecord)) as QueueRecord;
    delete record.noOfArrivalQueueRetries;
    delete record.trace_id;
    delete record.context_id;
    delete record.reference;
    delete record.AppointmentId;
    delete record.bookingProductId;
    return record;
  };
}
