import { CRMTestAccommodation } from '../common/test-accommodation';
import { SARASAccommodationAssistant } from '../../../shared/interfaces';

class CRMAccommodationAssistant {
  'ftts_Testhistory@odata.bind': string;

  ftts_datetime?: string;

  ftts_admittedby?: string;

  ftts_assistantsignature?: string;

  ftts_assistantname?: string;

  ftts_organisation?: string;

  ftts_accommodationtype?: string;

  'ownerid@odata.bind': string;

  constructor(accomodation: SARASAccommodationAssistant, testHistoryId: string, ownerIdBind: string) {
    this['ftts_Testhistory@odata.bind'] = testHistoryId;
    this.ftts_datetime = accomodation.DateTime;
    this.ftts_admittedby = accomodation.AdmittedBy;
    this.ftts_assistantname = accomodation.AssistantName;
    this.ftts_organisation = accomodation.Organisation;
    this.ftts_accommodationtype = CRMTestAccommodation.mapFromSARASArray(accomodation.AccommodationType);
    this.ftts_assistantsignature = accomodation.AssistantSignature;
    this['ownerid@odata.bind'] = ownerIdBind;
  }
}

export default CRMAccommodationAssistant;
