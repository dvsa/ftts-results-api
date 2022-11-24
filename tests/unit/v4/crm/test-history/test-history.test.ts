/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Dayjs } from 'dayjs';
import {
  SARASDeliveryMode,
  SARASGender,
  SARASItemType,
  SARASResultBody,
  SARASTestType,
  SARASTextLanguage,
} from '../../../../../src/shared/interfaces';
import { Organisation } from '../../../../../src/shared/crm/account/remit';
import { CRMTestStatuses } from '../../../../../src/v4/crm/common/test-status';
import { CRMDeliveryModes } from '../../../../../src/v4/crm/test-history/delivery-mode';
import CRMTestHistory from '../../../../../src/v4/crm/test-history/test-history';
import { CRMTextLanguages } from '../../../../../src/v4/crm/test-history/test-language';
import config from '../../../../../src/shared/config';

jest.mock('dayjs', () =>
  jest.fn((): Dayjs => jest.requireActual('dayjs')('2020-08-20T13:00:00.000Z')),
);

describe('CRMTestHistory', () => {
  test('correctly maps all required fields', () => {
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

    const result: CRMTestHistory = new CRMTestHistory(
      data as SARASResultBody,
      '1000',
      'test-owner-id',
      Organisation.DVSA,
      '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
    );

    expect(result.ftts_teststatus).toEqual(CRMTestStatuses.INCOMPLETE);
    expect(result.ftts_testdate).toEqual(data.Appointment.DateTime);
    expect(result['ftts_person@odata.bind']).toBe(`/contacts(${data.Candidate.CandidateID})`);
    expect(result['ftts_BookingProduct@odata.bind']).toBe('/ftts_bookingproducts(9b3d6d4e-a4cd-ea11-a812-00224801cecd)');
    expect(result['ftts_Testtype@odata.bind']).toBe('/products(1000)');
    expect(result.ftts_lastupdatedbyapi).toBe('2020-08-20T13:00:00.000Z');
    expect(result.ftts_tarsexportedstatus).toBe('Unprocessed');
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
    expect(result.ftts_certificateexpirydate).toBeUndefined();
  });

  describe('correctly maps all fields', () => {
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
        TestType: 11,
        CertificateExpiryDate: '2025-07-24T23:00:00Z',
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
        FormID: 'MCQTestResultFormID{{firstName}}',
        TestScore: 60.6,
        TotalScore: 90.07,
        Percentage: 70.999,
        ResultStatus: 0,
        Sections: [
          {
            Name: 'MCQSection-1',
            Order: 35,
            MaxScore: 100.09,
            TotalScore: 85.009,
            Percentage: 78.9,
            StartTime: '{{admissionDate}}T09:00:02Z',
            EndTime: '{{admissionDate}}T10:20:02Z',
            Items: [
              {
                Code: 'MCQSection-1-Item-1',
                Type: 0,
                Version: 1.0,
                Topic: 'Road Procedure',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 59.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-1-Item-2',
                Type: 0,
                Version: 1.0,
                Topic:
                  'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 29.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-1-Item-3',
                Type: 0,
                Version: 1.0,
                Topic: 'Driving Test, Disabilities, Law',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 19.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-1-Item-4',
                Type: 0,
                Version: 1.0,
                Topic: 'Publications, Instructional Techniques',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 15.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
            ],
          },
          {
            Name: 'MCQSection-2',
            Order: 35,
            MaxScore: 100.09,
            TotalScore: 85.009,
            Percentage: 78.9,
            StartTime: '{{admissionDate}}T09:00:02Z',
            EndTime: '{{admissionDate}}T10:20:02Z',
            Items: [
              {
                Code: 'MCQSection-2-Item-1',
                Type: 0,
                Version: 1.0,
                Topic: 'Road Procedure',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 10.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-2-Item-2',
                Type: 0,
                Version: 1.0,
                Topic:
                  'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 11.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-2-Item-3',
                Type: 0,
                Version: 1.0,
                Topic: 'Driving Test, Disabilities, Law',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 19.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-2-Item-4',
                Type: 0,
                Version: 1.0,
                Topic: 'Publications, Instructional Techniques',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 19.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
            ],
          },
          {
            Name: 'MCQSection-3',
            Order: 35,
            MaxScore: 100.09,
            TotalScore: 85.009,
            Percentage: 78.9,
            StartTime: '{{admissionDate}}T09:00:02Z',
            EndTime: '{{admissionDate}}T10:20:02Z',
            Items: [
              {
                Code: 'MCQSection-3-Item-1',
                Type: 0,
                Version: 1.0,
                Topic: 'Road Procedure',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 10.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-3-Item-2',
                Type: 0,
                Version: 1.0,
                Topic:
                  'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 11.01,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-3-Item-3',
                Type: 0,
                Version: 1.0,
                Topic: 'Driving Test, Disabilities, Law',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 19.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
              {
                Code: 'MCQSection-3-Item-4',
                Type: 0,
                Version: 1.0,
                Topic: 'Publications, Instructional Techniques',
                Attempted: true,
                UserResponses: [
                  'UserResponses1MCQTestResult{{firstName}}',
                  'UserResponses2MCQTestResult{{firstName}}',
                ],
                Order: 10,
                TimeSpent: 20,
                Score: 19.03,
                CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
              },
            ],
          },
        ],
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

    test('when toggle is off, mcqband scores are undefined', () => {
      const result: CRMTestHistory = new CRMTestHistory(
        data as SARASResultBody,
        '1001',
        '/teams(test-owner-id)',
        Organisation.DVA,
        '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
      );

      expect(result.ftts_mcqband1score).toBeUndefined();
      expect(result.ftts_mcqband2score).toBeUndefined();
      expect(result.ftts_mcqband3score).toBeUndefined();
      expect(result.ftts_mcqband4score).toBeUndefined();
    });

    describe('when toggle is on', () => {
      beforeAll(() => {
        config.featureToggles.calculateTestBandScores = true;
      });

      afterAll(() => {
        config.featureToggles.calculateTestBandScores = false;
      });

      test('and Organisation is DVA, mcqband scores are calculated for ADI', () => {
        const result: CRMTestHistory = new CRMTestHistory(
          data as SARASResultBody,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBe(79.03);
        expect(result.ftts_mcqband2score).toBe(51.03);
        expect(result.ftts_mcqband3score).toBe(57.09);
        expect(result.ftts_mcqband4score).toBe(53.09);
      });

      test('and Organisation is DVA, mcqband scores are calculated for AMI', () => {
        const mcqTestResultsForAMI = {
          FormID: 'MCQ Form ID',
          TestScore: 56.789,
          TotalScore: 23.456,
          Percentage: 37,
          ResultStatus: 3,
          Sections: [
            {
              Name: 'Section 1',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
                  Version: 1,
                  Topic: 'Road Procedure & Rider Safety',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 49.0,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic:
                    'Traffic Signs and Signals, Bike Control, Pedestrians, Mechanical Knowledge',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic:
                    'Driving Test, Disabilities, The Law & The Environment',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 13.06,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
            {
              Name: 'Section 2',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: 0,
                  Version: 1,
                  Topic:
                    'Traffic Signs and Signals, Bike Control, Pedestrians, Mechanical Knowledge',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 29.02,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: 'Road Procedure & Rider Safety',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: 'Publications, Instructional Techniques',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 50.03,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
          ],
        };
        const dataCopy = {
          ...data,
          MCQTestResult: mcqTestResultsForAMI,
        } as SARASResultBody;

        dataCopy.TestInformation.TestType = SARASTestType.AMI1;
        const result: CRMTestHistory = new CRMTestHistory(
          dataCopy,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBe(89.04);
        expect(result.ftts_mcqband2score).toBe(69.06);
        expect(result.ftts_mcqband3score).toBe(13.06);
        expect(result.ftts_mcqband4score).toBe(50.03);
      });

      test('and Organisation is DVA and items don\'t match configured topics, mcqband scores are 0', () => {
        const mcqTestResultsWithNonMatchingTopics = {
          FormID: 'MCQ Form ID',
          TestScore: 56.789,
          TotalScore: 23.456,
          Percentage: 37,
          ResultStatus: 3,
          Sections: [
            {
              Name: 'Section 1',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
                  Version: 1,
                  Topic: 'Not Road Procedure',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 49.0,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic:
                    'Not Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: 'Some random topic',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 13.06,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
            {
              Name: 'Section 2',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: 0,
                  Version: 1,
                  Topic:
                    'Not Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 29.02,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: 'Not Road Procedure',
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
            {
              Name: 'Section 3',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [],
            },
          ],
        };

        const dataCopy: Partial<SARASResultBody> = {
          ...data,
          MCQTestResult: mcqTestResultsWithNonMatchingTopics,
        };
        const result: CRMTestHistory = new CRMTestHistory(
          dataCopy as SARASResultBody,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBe(0);
        expect(result.ftts_mcqband2score).toBe(0);
        expect(result.ftts_mcqband3score).toBe(0);
        expect(result.ftts_mcqband4score).toBe(0);
      });

      test('and Organisation is DVA and items are empty, mcqband scores are 0', () => {
        const mcqTestResultsWithEmptyItems = {
          FormID: 'MCQ Form ID',
          TestScore: 56.789,
          TotalScore: 23.456,
          Percentage: 37,
          ResultStatus: 3,
          Sections: [
            {
              Name: 'Section 1',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [],
            },
            {
              Name: 'Section 2',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [],
            },
            {
              Name: 'Section 3',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [],
            },
          ],
        };

        const dataCopy: Partial<SARASResultBody> = {
          ...data,
          MCQTestResult: mcqTestResultsWithEmptyItems,
        };
        const result: CRMTestHistory = new CRMTestHistory(
          dataCopy as SARASResultBody,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBe(0);
        expect(result.ftts_mcqband2score).toBe(0);
        expect(result.ftts_mcqband3score).toBe(0);
        expect(result.ftts_mcqband4score).toBe(0);
      });

      test('and Organisation is DVSA, mcqband scores are undefined', () => {
        const result: CRMTestHistory = new CRMTestHistory(
          data as SARASResultBody,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVSA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBeUndefined();
        expect(result.ftts_mcqband2score).toBeUndefined();
        expect(result.ftts_mcqband3score).toBeUndefined();
        expect(result.ftts_mcqband4score).toBeUndefined();
      });

      test('and Organisation is DVA, mcqband scores are undefined for CAR', () => {
        const mcqTestResultsForAMI = {
          FormID: 'MCQ Form ID',
          TestScore: 56.789,
          TotalScore: 23.456,
          Percentage: 37,
          ResultStatus: 3,
          Sections: [
            {
              Name: 'Section 1',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
                  Version: 1,
                  Topic: config.dva.amiBands.band1,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 49.0,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: config.dva.amiBands.band2,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: config.dva.amiBands.band3,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 13.06,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
            {
              Name: 'Section 2',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [
                {
                  Code: 'MCQTestResultCode{{firstName}}-1',
                  Type: 0,
                  Version: 1,
                  Topic: config.dva.amiBands.band2,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 29.02,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: config.dva.amiBands.band1,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 40.04,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
                {
                  Code: 'MCQTestResultCode{{firstName}}-2',
                  Type: 0,
                  Version: 1,
                  Topic: config.dva.amiBands.band4,
                  Attempted: true,
                  UserResponses: [
                    'UserResponses1MCQTestResult{{firstName}}',
                    'UserResponses2MCQTestResult{{firstName}}',
                  ],
                  Order: 10,
                  TimeSpent: 20,
                  Score: 50.03,
                  CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
                },
              ],
            },
            {
              Name: 'Section 3',
              Order: 35,
              MaxScore: 100.09,
              TotalScore: 85.009,
              Percentage: 78.9,
              StartTime: '2020-07-24T09:00:02Z',
              EndTime: '2020-07-24T10:20:02Z',
              Items: [],
            },
          ],
        };
        const dataCopy = {
          ...data,
          MCQTestResult: mcqTestResultsForAMI,
        } as SARASResultBody;
        dataCopy.TestInformation.TestType = SARASTestType.CAR;
        const result: CRMTestHistory = new CRMTestHistory(
          dataCopy,
          '1001',
          '/teams(test-owner-id)',
          Organisation.DVA,
          '9b3d6d4e-a4cd-ea11-a812-00224801cecd',
        );

        expect(result.ftts_mcqband1score).toBeUndefined();
        expect(result.ftts_mcqband2score).toBeUndefined();
        expect(result.ftts_mcqband3score).toBeUndefined();
        expect(result.ftts_mcqband4score).toBeUndefined();
      });
    });
  });
});
