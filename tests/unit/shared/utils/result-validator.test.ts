import { ResultValidator } from '../../../../src/shared/utils/result-validator';
import { resultRecordV3 } from '../../../mocks/result-records';
import SARASResultBodySchema from '../../../../src/v3/schemas/SARASResultBodyV3.schema.json';
import { SARASResultBody } from '../../../../src/shared/interfaces';

describe('ResultValidator', () => {
  describe('API requests', () => {
    let result: SARASResultBody;
    beforeEach(() => {
      result = JSON.parse(JSON.stringify(resultRecordV3)) as SARASResultBody;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('returns true for valid result', () => {
      const valid = ResultValidator.validateResultRequest(result, SARASResultBodySchema);

      expect(valid).toBe(true);
    });

    test('throws validation error for empty body', () => {
      expect(() => ResultValidator.validateResultRequest(null as any, SARASResultBodySchema))
        .toThrow('Validation Error - Request body is empty or not valid');
    });

    test('throws validation error for strings under minimum length', () => {
      result.Candidate.Name = 'b';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate.Name should NOT be shorter than 2 characters');
    });

    test('throws validation error for strings under minimum length - non mandatory fields', () => {
      result.TestInformation.CertificationID = 'no8char';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.TestInformation.CertificationID should NOT be shorter than 8 characters');
    });

    test('throws validation error for strings over maximum length', () => {
      result.Candidate.Name = 'LoremipsumdolorsitametconsecteturadipiscingelitFusce';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate.Name should NOT be longer than 50 characters');
    });

    test('throws validation error for empty string', () => {
      result.Candidate.CandidateID = '';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate.CandidateID should NOT be shorter than 1 characters');
    });

    test('throws validation error for empty strings - non mandatory fields', () => {
      result.TestInformation.CertificationID = '';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.TestInformation.CertificationID should NOT be shorter than 8 characters');
    });

    test('throws validation error for empty spaces', () => {
      result.Candidate.CandidateID = '  ';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate.CandidateID String cannot be empty');
    });

    test('throws validation error for empty spaces - non mandatory fields', () => {
      result.TestInformation.CertificationID = '          ';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.TestInformation.CertificationID String cannot be empty');
    });

    test('throws validation error for invalid DOB format', () => {
      // date with YYYY-DD-MM is rejected
      result.Candidate.DOB = '2012-24-12';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate.DOB should match format "date"');
    });

    test('throws validation error for invalid date-time format', () => {
      result.Appointment.DateTime = 'nondate';

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Appointment.DateTime should match format "date-time"');
    });

    test('throws validation error for invalid result', () => {
      delete result.Candidate.CandidateID;

      expect(() => ResultValidator.validateResultRequest(result, SARASResultBodySchema))
        .toThrow('Validation Error - data.Candidate should have required property \'CandidateID\'');
    });

    test('throws validation error for additional keys/values', () => {
      const resultRequest = { ...result, extra: 'fields' };

      expect(() => ResultValidator.validateResultRequest(resultRequest, SARASResultBodySchema))
        .toThrow('Validation Error - data should NOT have additional properties');
    });
  });
});
