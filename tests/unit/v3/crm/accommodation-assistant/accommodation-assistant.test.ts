import { SARASAccommodationAssistant } from '../../../../../src/shared/interfaces';
import CRMAccommodationAssistant from '../../../../../src/v3/crm/accommodation-assistant/accommodation-assistant';

describe('CRMAccommodationAssistant', () => {
  describe('new CRMAccommodationAssistant', () => {
    test('GIVEN a SARASAccommodationAssistant WHEN called THEN a new CRMAccommodationAssistant is created', () => {
      const accommodation: SARASAccommodationAssistant = {
        AccommodationType: [1, 2, 3],
        AdmittedBy: 'test',
        AssistantName: 'Foysal',
        AssistantSignature: 'aahhshahs',
        DateTime: '2020-07-24T23:00:00Z',
        Organisation: 'DWP',
      };

      const expectedAccommodation = new CRMAccommodationAssistant(accommodation, '1234', 'test-owner-id');

      expect(expectedAccommodation['ftts_Testhistory@odata.bind']).toEqual('1234');
      expect(expectedAccommodation.ftts_accommodationtype).toEqual('2,3,4');
      expect(expectedAccommodation.ftts_admittedby).toEqual(accommodation.AdmittedBy);
      expect(expectedAccommodation.ftts_assistantname).toEqual(accommodation.AssistantName);
      expect(expectedAccommodation.ftts_assistantsignature).toEqual(accommodation.AssistantSignature);
      expect(expectedAccommodation.ftts_datetime).toEqual(accommodation.DateTime);
      expect(expectedAccommodation.ftts_organisation).toEqual(accommodation.Organisation);
      expect(expectedAccommodation['ownerid@odata.bind']).toEqual('/teams(test-owner-id)');
    });
    test('GIVEN undefined WHEN called THEN a error is thrown', () => {
      expect(() => new CRMAccommodationAssistant(undefined, '', '')).toThrow();
    });
  });
});
