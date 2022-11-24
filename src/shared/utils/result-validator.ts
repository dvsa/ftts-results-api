import Ajv from 'ajv';

import { Schema } from '../../v4/interfaces';
import { SARASResultBody, ValidationError } from '../interfaces';

export class ResultValidator {
  public static validateResultRequest(request: SARASResultBody, schemaToValidateAgainst: Schema): boolean {
    if (request) {
      const ajv = new Ajv();
      ajv.addKeyword('notEmpty', {
        type: 'string',
        validate(schema: unknown, data: string, parentSchema: unknown, dataPath: string | undefined) {
          const isValid = typeof data === 'string' && data.trim() !== '';
          if (!isValid) {
            throw new ValidationError(`Validation Error - data${dataPath || ''} String cannot be empty`);
          }
          return isValid;
        },
      });

      const valid = ajv.validate(schemaToValidateAgainst, request);

      if (!valid) {
        throw new ValidationError(`Validation Error - ${ajv.errorsText()}`);
      }

      return Boolean(valid);
    }

    throw new ValidationError('Validation Error - Request body is empty or not valid');
  }
}
