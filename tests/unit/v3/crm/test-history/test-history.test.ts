/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Dayjs } from 'dayjs';

import CRMTestHistory from '../../../../../src/v3/crm/test-history/test-history';
import { CRMColourFormats } from '../../../../../src/v3/crm/test-history/colour-format';
import { CRMDeliveryModes } from '../../../../../src/v3/crm/test-history/delivery-mode';
import { CRMTestStatuses } from '../../../../../src/v3/crm/common/test-status';
import { CRMTextLanguages } from '../../../../../src/v3/crm/test-history/test-language';
import { CRMVoiceoverLanguages } from '../../../../../src/v3/crm/test-history/voiceover-language';
import { Organisation } from '../../../../../src/v3/crm/account/remit';
import ExpiryDate from '../../../../../src/v3/crm/test-history/expiry-date';
import {
  SARASDeliveryMode, SARASGender, SARASResultBody, SARASTestType, SARASTextLanguage,
} from '../../../../../src/shared/interfaces';

jest.mock('dayjs', () => jest.fn((): Dayjs => jest.requireActual('dayjs')('2020-08-20T13:00:00.000Z')));

describe('CRMTestHistory', () => {
  test('correctly maps all required fields', () => {
    ExpiryDate.calculateExpiryDate = jest.fn().mockReturnValue(undefined);
    const data: Partial<SARASResultBody> = {
      TestInformation: {
        OverallStatus: 3,
        DeliveryMode: SARASDeliveryMode.IHTTC,
        TestType: SARASTestType.EXAMINER_CAR,
        TextLanguage: SARASTextLanguage.ENGLISH,
      },
      Appointment: {
        DateTime: '2020-07-24T23:00:00Z',
      },
      Candidate: {
        CandidateID: '9bca9dbe-1ac8-ea11-a812-000d3a7f128d',
        DOB: '01/01/1960',
        DrivingLicenseNumber: '1234123412341234',
        Gender: SARASGender.UNKNOWN,
        Name: 'Test',
        Surname: 'Tester',
      },
    };

    const result: CRMTestHistory = new CRMTestHistory(data as SARASResultBody, '1000', 'test-owner-id', Organisation.DVSA, '9b3d6d4e-a4cd-ea11-a812-00224801cecd');

    expect(result.ftts_teststatus).toEqual(CRMTestStatuses.INCOMPLETE);
    expect(result.ftts_testdate).toEqual(data.Appointment.DateTime);
    expect(result['ftts_person@odata.bind']).toEqual(`/contacts(${data.Candidate.CandidateID})`);
    expect(result['ftts_BookingProduct@odata.bind']).toEqual('/ftts_bookingproducts(9b3d6d4e-a4cd-ea11-a812-00224801cecd)');
    expect(result['ftts_Testtype@odata.bind']).toEqual('/products(1000)');
    expect(result.ftts_lastupdatedbyapi).toEqual('2020-08-20T13:00:00.000Z');
    expect(result.ftts_tarsexportedstatus).toEqual('Unprocessed');
    expect(result.ftts_admissiondate).toBeUndefined();
    expect(result.ftts_admittedby).toBeUndefined();
    expect(result.ftts_candidatephoto).toBeUndefined();
    expect(result.ftts_candidatesignature).toBeUndefined();
    expect(result.ftts_certificatenumber).toBeUndefined();
    expect(result.ftts_colourformat).toBeUndefined();
    expect(result.ftts_deliverymode).toEqual(CRMDeliveryModes.IHTTC);
    expect(result.ftts_endtime).toBeUndefined();
    expect(result.ftts_hptformid).toBeUndefined();
    expect(result.ftts_hptpercentage).toBeUndefined();
    expect(result.ftts_hpttestscore).toBeUndefined();
    expect(result.ftts_hptteststatus).toBeUndefined();
    expect(result.ftts_hpttotalscore).toBeUndefined();
    expect(result.ftts_invigilator).toBeUndefined();
    expect(result.ftts_mcqformid).toBeUndefined();
    expect(result.ftts_mcqpercentage).toBeUndefined();
    expect(result.ftts_mcqtestscore).toBeUndefined();
    expect(result.ftts_mcqteststatus).toBeUndefined();
    expect(result.ftts_mcqtotalscore).toBeUndefined();
    expect(result.ftts_starttime).toBeUndefined();
    expect(result.ftts_testaccommodation).toBeUndefined();
    expect(result.ftts_textlanguage).toEqual(CRMTextLanguages.ENGLISH);
    expect(result.ftts_voiceoverlanguage).toBeUndefined();
    expect(result.ftts_workstation).toBeUndefined();
    expect(result.ftts_workstationperformancecpu).toBeUndefined();
    expect(result.ftts_workstationperformanceram).toBeUndefined();
    expect(result.ftts_expirydate).toBeUndefined();
  });

  test('correctly maps all fields', () => {
    ExpiryDate.calculateExpiryDate = jest.fn().mockReturnValue('2022-07-23');
    const data: Partial<SARASResultBody> = {
      TestInformation: {
        OverallStatus: 1,
        CertificationID: 'ABCDEFGHI',
        WorkStation: 'Windows',
        WorkStationPerformance: {
          CPU: 76,
          RAM: 55,
        },
        StartTime: '2020-07-24T10:05:00Z',
        EndTime: '2020-07-24T10:10:00Z',
        Invigilator: 'Hannah',
        DeliveryMode: 3,
        TextLanguage: 1,
        AccommodationType: [12, 10],
        ColourFormat: 0,
        VoiceOverLanguage: 7,
        TestType: 1,
      },
      Appointment: {
        DateTime: '2020-07-24T10:00:00Z',
      },
      Candidate: {
        CandidateID: '9bca9dbe-1ac8-ea11-a812-000d3a7f128d',
        DOB: '01/01/1960',
        DrivingLicenseNumber: '1234123412341234',
        Gender: SARASGender.OTHER,
        Name: 'Test',
        Surname: 'Tester',
      },
      Admission: {
        DateTime: '2020-07-24T10:01:00Z',
        AdmittedBy: 'Prem',
        CandidatePhoto: 'www.google.com',
        CandidateSignature: 'www.google.co.uk',
      },
      MCQTestResult: {
        FormID: 'MCQ Form ID',
        TestScore: 56.789,
        TotalScore: 23.456,
        Percentage: 37,
        ResultStatus: 3,
        Sections: [],
      },
      HPTTestResult: {
        FormID: 'HPT Form ID',
        TestScore: 78,
        TotalScore: 54.4,
        Percentage: 59.999,
        ResultStatus: 3,
        Sections: [],
      },
    };

    const result: CRMTestHistory = new CRMTestHistory(data as SARASResultBody, '1001', 'test-owner-id', Organisation.DVSA, '9b3d6d4e-a4cd-ea11-a812-00224801cecd');

    expect(result['ftts_BookingProduct@odata.bind']).toEqual('/ftts_bookingproducts(9b3d6d4e-a4cd-ea11-a812-00224801cecd)');
    expect(result.ftts_admissiondate).toEqual('2020-07-24T10:01:00Z');
    expect(result.ftts_admittedby).toEqual('Prem');
    expect(result.ftts_candidatephoto).toEqual('www.google.com');
    expect(result.ftts_candidatesignature).toEqual('www.google.co.uk');
    expect(result.ftts_certificatenumber).toEqual(data.TestInformation.CertificationID);
    expect(result.ftts_colourformat).toEqual(CRMColourFormats.NA);
    expect(result.ftts_deliverymode).toEqual(CRMDeliveryModes.AT_HOME);
    expect(result.ftts_endtime).toEqual(data.TestInformation.EndTime);
    expect(result.ftts_hptformid).toEqual('HPT Form ID');
    expect(result.ftts_hptpercentage).toEqual(59.999);
    expect(result.ftts_hpttestscore).toEqual(78);
    expect(result.ftts_hptteststatus).toEqual(CRMTestStatuses.INCOMPLETE);
    expect(result.ftts_hpttotalscore).toEqual(54.4);
    expect(result.ftts_invigilator).toEqual(data.TestInformation.Invigilator);
    expect(result.ftts_mcqformid).toEqual('MCQ Form ID');
    expect(result.ftts_mcqpercentage).toEqual(37);
    expect(result.ftts_mcqtestscore).toEqual(56.789);
    expect(result.ftts_mcqteststatus).toEqual(CRMTestStatuses.INCOMPLETE);
    expect(result.ftts_mcqtotalscore).toEqual(23.456);
    expect(result['ftts_person@odata.bind']).toEqual(`/contacts(${data.Candidate.CandidateID})`);
    expect(result.ftts_starttime).toEqual(data.TestInformation.StartTime);
    expect(result.ftts_testaccommodation).toEqual('13,11');
    expect(result.ftts_testdate).toEqual(data.Appointment.DateTime);
    expect(result.ftts_teststatus).toEqual(CRMTestStatuses.PASS);
    expect(result.ftts_textlanguage).toEqual(CRMTextLanguages.WELSH);
    expect(result.ftts_voiceoverlanguage).toEqual(CRMVoiceoverLanguages.PORTUGUESE);
    expect(result.ftts_workstation).toEqual(data.TestInformation.WorkStation);
    expect(result.ftts_workstationperformancecpu).toEqual(76);
    expect(result.ftts_workstationperformanceram).toEqual(55);
    expect(result['ftts_Testtype@odata.bind']).toEqual('/products(1001)');
    expect(result['ownerid@odata.bind']).toEqual('/teams(test-owner-id)');
    expect(result.ftts_expirydate).toEqual('2022-07-23');
    expect(result.ftts_lastupdatedbyapi).toEqual('2020-08-20T13:00:00.000Z');
    expect(result.ftts_tarsexportedstatus).toEqual('Unprocessed');
  });
});
