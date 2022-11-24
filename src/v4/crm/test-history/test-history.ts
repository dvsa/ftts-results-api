import dayjs from 'dayjs';
import {
  SARASItemResponse,
  SARASMCQItemResponse,
  SARASMCQSection,
  SARASResultBody,
  SARASTestType,
} from '../../../shared/interfaces';
import { Organisation } from '../../../shared/crm/account/remit';
import { CRMTestAccommodation } from '../common/test-accommodation';
import { CRMTestStatus, CRMTestStatuses } from '../common/test-status';
import { CRMColourFormat, CRMColourFormats } from './colour-format';
import { CRMDeliveryMode, CRMDeliveryModes } from './delivery-mode';
import { CRMTextLanguage, CRMTextLanguages } from './test-language';
import {
  CRMVoiceoverLanguage,
  CRMVoiceoverLanguages,
} from './voiceover-language';
import config from '../../../shared/config';

class CRMTestHistory {
  'ftts_person@odata.bind': string;

  ftts_teststatus: CRMTestStatuses;

  ftts_testdate: string;

  ftts_certificatenumber?: string;

  'ftts_BookingProduct@odata.bind': string;

  ftts_admissiondate?: string;

  ftts_admittedby?: string;

  ftts_candidatesignature?: string;

  ftts_candidatephoto?: string;

  ftts_workstation?: string;

  ftts_workstationperformancecpu?: number;

  ftts_workstationperformanceram?: number;

  ftts_starttime?: string;

  ftts_endtime?: string;

  ftts_invigilator?: string;

  ftts_deliverymode?: CRMDeliveryModes;

  'ftts_Testtype@odata.bind'?: string;

  ftts_textlanguage?: CRMTextLanguages;

  ftts_testaccommodation?: string;

  ftts_colourformat?: CRMColourFormats;

  ftts_voiceoverlanguage?: CRMVoiceoverLanguages;

  ftts_mcqformid?: string;

  ftts_mcqtestscore?: number;

  ftts_mcqtotalscore?: number;

  ftts_mcqpercentage?: number;

  ftts_mcqteststatus?: number;

  ftts_hptformid?: string;

  ftts_hpttestscore?: number;

  ftts_hpttotalscore?: number;

  ftts_hptpercentage?: number;

  ftts_hptteststatus?: number;

  ftts_lastupdatedbyapi?: string;

  ftts_tarsexportedstatus: string;

  ftts_certificateexpirydate?: string;

  ftts_mcqband1score?: number;

  ftts_mcqband2score?: number;

  ftts_mcqband3score?: number;

  ftts_mcqband4score?: number;

  'ownerid@odata.bind': string;

  constructor(
    data: SARASResultBody,
    productId: string,
    ownerIdBind: string,
    organisation: Organisation | undefined,
    bookingProductId: string,
  ) {
    // Required by CRM
    this.ftts_teststatus = CRMTestStatus.mapFromSARAS(data.TestInformation.OverallStatus);
    this.ftts_testdate = data.Appointment.DateTime;
    this['ftts_person@odata.bind'] = `/contacts(${data.Candidate.CandidateID})`;
    this['ftts_BookingProduct@odata.bind'] = `/ftts_bookingproducts(${bookingProductId})`;
    // Optional
    this.ftts_certificatenumber = data.TestInformation.CertificationID;
    this.ftts_admissiondate = data.Admission?.DateTime;
    this.ftts_admittedby = data.Admission?.AdmittedBy;
    this.ftts_candidatesignature = data.Admission?.CandidateSignature;
    this.ftts_candidatephoto = data.Admission?.CandidatePhoto;
    this.ftts_workstation = data.TestInformation.WorkStation;
    this.ftts_workstationperformancecpu = data.TestInformation.WorkStationPerformance?.CPU;
    this.ftts_workstationperformanceram = data.TestInformation.WorkStationPerformance?.RAM;
    this.ftts_starttime = data.TestInformation.StartTime;
    this.ftts_endtime = data.TestInformation.EndTime;
    this.ftts_invigilator = data.TestInformation.Invigilator;
    this.ftts_deliverymode = CRMDeliveryMode.mapFromSARAS(data.TestInformation.DeliveryMode);
    this['ftts_Testtype@odata.bind'] = `/products(${productId})`;
    this.ftts_textlanguage = CRMTextLanguage.mapFromSARAS(data.TestInformation.TextLanguage);
    this.ftts_testaccommodation = CRMTestAccommodation.mapFromSARASArray(data.TestInformation.AccommodationType);
    this.ftts_colourformat = CRMColourFormat.mapFromSARAS(data.TestInformation.ColourFormat);
    this.ftts_voiceoverlanguage = CRMVoiceoverLanguage.mapFromSARAS(data.TestInformation.VoiceOverLanguage);
    this.ftts_mcqformid = data.MCQTestResult?.FormID;
    this.ftts_mcqtestscore = data.MCQTestResult?.TestScore;
    this.ftts_mcqtotalscore = data.MCQTestResult?.TotalScore;
    this.ftts_mcqpercentage = data.MCQTestResult?.Percentage;
    this.ftts_mcqteststatus = CRMTestStatus.optionalMapFromSARAS(data.MCQTestResult?.ResultStatus);
    this.ftts_hptformid = data.HPTTestResult?.FormID;
    this.ftts_hpttestscore = data.HPTTestResult?.TestScore;
    this.ftts_hpttotalscore = data.HPTTestResult?.TotalScore;
    this.ftts_hptpercentage = data.HPTTestResult?.Percentage;
    this.ftts_hptteststatus = CRMTestStatus.optionalMapFromSARAS(data.HPTTestResult?.ResultStatus);
    this.ftts_lastupdatedbyapi = dayjs().toISOString();
    this.ftts_tarsexportedstatus = 'Unprocessed';
    this['ownerid@odata.bind'] = ownerIdBind;
    this.ftts_certificateexpirydate = data.TestInformation.CertificateExpiryDate;

    if (
      config.featureToggles.calculateTestBandScores &&
      data?.MCQTestResult?.Sections &&
      this.isDVAInstructorTestMethod(organisation, data.TestInformation.TestType)
    ) {
      this.ftts_mcqband1score = this.calculateBandScores(
        data.MCQTestResult.Sections,
        data.TestInformation.TestType === SARASTestType.ADI1 ? config.dva.adiBands.band1 : config.dva.amiBands.band1,
      );
      this.ftts_mcqband2score = this.calculateBandScores(
        data.MCQTestResult.Sections,
        data.TestInformation.TestType === SARASTestType.ADI1 ? config.dva.adiBands.band2 : config.dva.amiBands.band2,
      );
      this.ftts_mcqband3score = this.calculateBandScores(
        data.MCQTestResult.Sections,
        data.TestInformation.TestType === SARASTestType.ADI1 ? config.dva.adiBands.band3 : config.dva.amiBands.band3,
      );
      this.ftts_mcqband4score = this.calculateBandScores(
        data.MCQTestResult.Sections,
        data.TestInformation.TestType === SARASTestType.ADI1 ? config.dva.adiBands.band4 : config.dva.amiBands.band4,
      );
    }
  }

  isDVAInstructorTestMethod(organisation: Organisation | undefined, testType: SARASTestType): boolean {
    return (
      organisation === Organisation.DVA && (testType === SARASTestType.ADI1 || testType === SARASTestType.AMI1)
    );
  }

  calculateBandScores(sections: SARASMCQSection[], topic: string) {
    const allItems: SARASItemResponse[] = sections.flatMap(
      (section) => section.Items,
    ) as SARASItemResponse[];

    return this.aggregateScores(
      allItems.filter(
        (item) =>
          item?.Topic === topic,
      ),
    );
  }

  aggregateScores(items: SARASMCQItemResponse[]): number {
    return items.reduce((aggregateScores: number, item: SARASMCQItemResponse): number => {
      if (item.Score) {
        return parseFloat((aggregateScores + item.Score).toFixed(2));
      }
      return aggregateScores;
    }, 0);
  }
}

export default CRMTestHistory;
