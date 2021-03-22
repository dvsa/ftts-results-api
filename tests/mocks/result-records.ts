import {
  SARASAccommodationType,
  SARASRegion,
  SARASDeliveryMode,
  SARASTestType,
  SARASTextLanguage,
  SARASVoiceOverLanguage,
  SARASColourFormat,
  SARASStatus,
  SARASResultBody,
} from '../../src/shared/interfaces';
import { QueueRecord } from '../../src/v3/interfaces';

export const resultRecordV1: SARASResultBody = {
  Candidate: {
    CandidateID: 'string',
    Name: 'string',
    Surname: 'string',
    DOB: '2020-07-24',
    Gender: 0,
    DrivingLicenseNumber: 'string',
    PersonalReferenceNumber: 'string',
    EntitlementConfirmation: 'string',
    Address: 'string rd, city',
  },
  Admission: {
    DateTime: '2020-07-24T09:20:02.754Z',
    AdmittedBy: 'string',
    CandidateSignature: 'dGhpcyBpcyBjYW5kaWRhdGUgc2lnbmF0dXJl',
    CandidatePhoto: 'dGhpcyBpcyBjYW5kaWRhdGUgcGhvdG8=',
  },
  AccommodationAssistant: [
    {
      DateTime: '2020-07-24T09:20:02.754Z',
      AdmittedBy: 'string',
      AssistantSignature: 'dGhpcyBpcyBBc3Npc3RhbnRTaWduYXR1cmU=',
      AssistantName: 'string',
      Organisation: 'string',
      AccommodationType: [
        SARASAccommodationType.SEPARATE_ROOM,
      ],
    },
  ],
  TestCentre: {
    TestCentreCode: 'string',
    Region: SARASRegion.A,
  },
  Appointment: {
    DateTime: '2020-07-24T09:20:02.754Z',
  },
  TestInformation: {
    WorkStation: 'string',
    WorkStationPerformance: {
      CPU: 0,
      RAM: 0,
    },
    StartTime: '2020-07-24T09:20:02.754Z',
    EndTime: '2020-07-24T09:20:02.754Z',
    Invigilator: 'string',
    DeliveryMode: SARASDeliveryMode.PERMANENT_TEST_CENTRE,
    TestType: SARASTestType.CAR,
    TextLanguage: SARASTextLanguage.ENGLISH,
    AccommodationType: SARASAccommodationType.SEPARATE_ROOM,
    VoiceOverLanguage: SARASVoiceOverLanguage.ENGLISH,
    CertificationID: 'fr3y4fw78y',
    ColourFormat: SARASColourFormat.FORMAT_ONE,
    OverallStatus: SARASStatus.PASS,
  },
  MCQTestResult: {
    FormID: 'string',
    TestScore: 0,
    TotalScore: 0,
    Percentage: 0,
    ResultStatus: 0,
    Sections: [
      {
        Name: 'string',
        Order: 0,
        MaxScore: 0,
        TotalScore: 0,
        Percentage: 0,
        StartTime: '2020-07-24T09:20:02.754Z',
        EndTime: '2020-07-24T09:20:02.754Z',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
            TimeSpent: 0,
            Score: 0,
            CorrectChoice: [
              'string',
            ],
          },
        ],
      },
    ],
  },
  HPTTestResult: {
    FormID: 'string',
    TestScore: 0,
    TotalScore: 0,
    Percentage: 0,
    ResultStatus: 0,
    Sections: [
      {
        Name: 'string',
        Order: 0,
        MaxScore: 0,
        TotalScore: 0,
        Percentage: 0,
        StartTime: '2020-07-24T09:20:02.754Z',
        EndTime: '2020-07-24T09:20:02.754Z',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
            Score: 0,
            FrameRate: 0,
            InappropriateKeyingsInvoked: 0,
          },
        ],
      },
    ],
  },
  TrialTest: {
    Sections: [
      {
        Name: 'string',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponse: [
              'string',
            ],
            Order: 0,
          },
        ],
      },
    ],
  },
  SurveyTest: {
    Sections: [
      {
        Name: 'string',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponse: [
              'string',
            ],
            Order: 0,
          },
        ],
      },
    ],
  },
};

export const resultRecordV2: SARASResultBody = {
  ...resultRecordV1,
  TestInformation: {
    ...resultRecordV1.TestInformation,
    AccommodationType: [SARASAccommodationType.SEPARATE_ROOM],
  },
};

export const resultRecordV3: SARASResultBody = {
  Candidate: {
    CandidateID: 'string',
    Name: 'string',
    Surname: 'string',
    DOB: '2020-07-24',
    Gender: 0,
    DrivingLicenseNumber: 'string',
    PersonalReferenceNumber: 'string',
    EntitlementConfirmation: 'string',
    Address: 'string rd, city',
  },
  Admission: {
    DateTime: '2020-07-24T09:20:02.754Z',
    AdmittedBy: 'string',
    CandidateSignature: 'dGhpcyBpcyBjYW5kaWRhdGUgc2lnbmF0dXJl',
    CandidatePhoto: 'dGhpcyBpcyBjYW5kaWRhdGUgcGhvdG8=',
  },
  AccommodationAssistant: [
    {
      DateTime: '2020-07-24T09:20:02.754Z',
      AdmittedBy: 'string',
      AssistantSignature: 'dGhpcyBpcyBBc3Npc3RhbnRTaWduYXR1cmU=',
      AssistantName: 'string',
      Organisation: 'string',
      AccommodationType: [
        SARASAccommodationType.SEPARATE_ROOM,
      ],
    },
  ],
  TestCentre: {
    TestCentreCode: 'string',
    Region: SARASRegion.A,
  },
  Appointment: {
    DateTime: '2020-07-24T09:20:02.754Z',
  },
  TestInformation: {
    WorkStation: 'string',
    WorkStationPerformance: {
      CPU: 0,
      RAM: 0,
    },
    StartTime: '2020-07-24T09:20:02.754Z',
    EndTime: '2020-07-24T09:20:02.754Z',
    Invigilator: 'string',
    DeliveryMode: SARASDeliveryMode.PERMANENT_TEST_CENTRE,
    TestType: SARASTestType.CAR,
    TextLanguage: SARASTextLanguage.ENGLISH,
    AccommodationType: [SARASAccommodationType.SEPARATE_ROOM],
    VoiceOverLanguage: SARASVoiceOverLanguage.ENGLISH,
    CertificationID: 'fr3y4fw78y',
    ColourFormat: SARASColourFormat.FORMAT_ONE,
    OverallStatus: SARASStatus.PASS,
  },
  MCQTestResult: {
    FormID: 'string',
    TestScore: 0,
    TotalScore: 0,
    Percentage: 0,
    ResultStatus: 0,
    Sections: [
      {
        Name: 'string',
        Order: 0,
        MaxScore: 0,
        TotalScore: 0,
        Percentage: 0,
        StartTime: '2020-07-24T09:20:02.754Z',
        EndTime: '2020-07-24T09:20:02.754Z',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
            TimeSpent: 0,
            Score: 0,
            CorrectChoice: [
              'string',
            ],
          },
        ],
      },
    ],
  },
  HPTTestResult: {
    FormID: 'string',
    TestScore: 0,
    TotalScore: 0,
    Percentage: 0,
    ResultStatus: 0,
    Sections: [
      {
        Name: 'string',
        Order: 0,
        MaxScore: 0,
        TotalScore: 0,
        Percentage: 0,
        StartTime: '2020-07-24T09:20:02.754Z',
        EndTime: '2020-07-24T09:20:02.754Z',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
            Score: 0,
            FrameRate: 0,
            InappropriateKeyingsInvoked: 0,
            ScoringWindows: [
              {
                Code: 'VM1-TR1',
                StartFrame: 265,
                EndFrame: 290,
                Score: 5,
              },
              {
                Code: 'VM1-TR2',
                StartFrame: 291,
                EndFrame: 314,
                Score: 4,
              },
            ],
            UsersScore: [
              {
                Code: 'VM1-TR1',
                Score: 5,
              },
              {
                Code: 'VM1-TR2',
                Score: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  TrialTest: {
    Sections: [
      {
        Name: 'string',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
          },
        ],
      },
    ],
  },
  SurveyTest: {
    Sections: [
      {
        Name: 'string',
        Items: [
          {
            Code: 'string',
            Type: 0,
            Version: 0,
            Topic: 'string',
            Attempted: true,
            UserResponses: [
              'string',
            ],
            Order: 0,
          },
        ],
      },
    ],
  },
};

export const queueRecord = (): QueueRecord => ({
  ...resultRecordV3,
  Appointment: {
    DateTime: '2020-07-24T09:20:02.754Z',
  },
  trace_id: 'testTraceId',
  noOfArrivalQueueRetries: 0,
  AppointmentId: 'mockAppointmentId',
  bookingProductId: 'mockBookingProductId',
});
