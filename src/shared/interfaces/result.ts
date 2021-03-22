export interface SARASResultBody {
  Candidate: SARASCandidate;
  Admission?: SARASAdmission;
  AccommodationAssistant?: SARASAccommodationAssistant[];
  TestCentre: SARASTestCentre;
  Appointment: SARASAppointment;
  TestInformation: SARASTestInformation;
  MCQTestResult?: SARASMCQTestResult;
  HPTTestResult?: SARASHPTTestResult;
  TrialTest?: SARASTrialTest;
  SurveyTest?: SARASSurveyTest;
}

export interface SARASCandidate {
  /**
   * @minLength 1
   * @maxLength 50
   * @notEmpty true
   */
  CandidateID: string;

  /**
   * @minLength 2
   * @maxLength 50
   * @notEmpty true
   */
  Name: string;

  /**
   * @minLength 1
   * @maxLength 50
   * @notEmpty true
   */
  Surname: string;

  /**
   * @format date
   */
  DOB: string;

  Gender: SARASGender;

  /**
   * @minLength 5
   * @maxLength 100
   * @notEmpty true
   */
  DrivingLicenseNumber: string;

  /**
   * @minLength 1
   * @maxLength 50
   * @notEmpty true
   */
  PersonalReferenceNumber?: string;

  /**
   * @minLength 1
   * @maxLength 50
   * @notEmpty true
   */
  EntitlementConfirmation?: string;

  /**
   * @minLength 10
   * @maxLength 1000
   * @notEmpty true
   */
  Address?: string;
}

export enum SARASGender {
  FEMALE = 0,
  MALE = 1,
  OTHER = 2,
  UNKNOWN = 3,
}

export interface SARASAdmission {
  /**
   * @format date-time
   */
  DateTime?: string;

  /**
   * @minLength 1
   * @maxLength 100
   * @notEmpty true
   */
  AdmittedBy?: string;

  /**
   * @minLength 1
   * @maxLength 200000
   * @notEmpty true
   */
  CandidateSignature?: string;

  /**
   * @minLength 1
   * @maxLength 700000
   * @notEmpty true
   */
  CandidatePhoto?: string;
}

export interface SARASAccommodationAssistant {
  /**
   * @format date-time
   */
  DateTime?: string;

  /**
   * @minLength 1
   * @maxLength 100
   * @notEmpty true
   */
  AdmittedBy?: string;

  /**
   * @minLength 1
   * @maxLength 200000
   * @notEmpty true
   */
  AssistantSignature?: string;

  /**
   * @minLength 1
   * @maxLength 100
   * @notEmpty true
   */
  AssistantName?: string;

  /**
   * @minLength 1
   * @maxLength 100
   * @notEmpty true
   */
  Organisation?: string;

  AccommodationType?: SARASAccommodationType[];
}

export enum SARASAccommodationType {
  EXTRA_LENGTH = 0,
  VOICEOVER_LANGUAGE = 1,
  BSL = 2,
  PAUSE_HPT = 3,
  OLM = 4,
  READER = 5,
  RECORDER = 6,
  BSL_TRANSLATOR = 7,
  LIP_SPEAKER = 8,
  LISTENING_AID = 9,
  SEPARATE_ROOM = 10,
  AT_HOME_TESTING = 11,
  LANGUAGE_TRANSLATOR = 12,
}

export interface SARASTestCentre {
  /**
   * @minLength 2
   * @maxLength 50
   * @notEmpty true
   */
  TestCentreCode: string;
  Region: SARASRegion;
}

export enum SARASRegion {
  NA = 0,
  A = 1,
  B = 2,
  C = 3,
}

export interface SARASAppointment {
  /**
   * @format date-time
   */
  DateTime: string;
}

export interface SARASTestInformation {
  WorkStation?: string;
  WorkStationPerformance?: {
    /**
     * @asType integer
     */
    CPU?: number;
    /**
     * @asType integer
     */
    RAM?: number;
  };
  /**
   * @format date-time
   */
  StartTime?: string;
  /**
   * @format date-time
   */
  EndTime?: string;
  DeliveryMode: SARASDeliveryMode;
  TestType: SARASTestType;
  TextLanguage: SARASTextLanguage;
  Invigilator?: string;
  VoiceOverLanguage?: SARASVoiceOverLanguage;
  /**
   * @minLength 8
   * @maxLength 10
   * @notEmpty true
   */
  CertificationID?: string;
  ColourFormat?: SARASColourFormat;
  AccommodationType?: SARASAccommodationType[];
  OverallStatus: SARASStatus;
}

export enum SARASTestType {
  CAR = 0,
  MOTORCYCLE = 2,
  LGVMC = 3,
  LGVHPT = 4,
  LGVCPC = 5,
  LGVCPCC = 6,
  PCVMC = 7,
  PCVHPT = 8,
  PCVCPC = 9,
  PCVCPCC = 10,
  ADI1 = 11,
  ADIHPT = 12,
  ERS = 13,
  AMI1 = 14,
  TAXI = 15,
  EXAMINER_CAR = 16,
}

export enum SARASColourFormat {
  NA = 0,
  FORMAT_ONE = 1,
  FORMAT_TWO = 2,
  FORMAT_THREE = 3,
}

export enum SARASDeliveryMode {
  IHTTC = 0,
  PERMANENT_TEST_CENTRE = 1,
  OCCASIONAL_TEST_CENTRE = 2,
  AT_HOME = 3,
}

export enum SARASStatus {
  FAIL = 0,
  PASS = 1,
  NOT_STARTED = 2,
  INCOMPLETE = 3,
}

export enum SARASTextLanguage {
  ENGLISH = 0,
  WELSH = 1,
}

export enum SARASVoiceOverLanguage {
  ENGLISH = 0,
  WELSH = 1,
  ARABIC = 2,
  FARSI = 3,
  CANTONESE = 4,
  TURKISH = 5,
  POLISH = 6,
  PORTUGUESE = 7,
}

export interface SARASMCQTestResult {
  /**
   * @minLength 1
   * @maxLength 100
   */
  FormID?: string;
  TestScore?: number;
  TotalScore?: number;
  Percentage?: number;
  ResultStatus?: SARASStatus;
  Sections?: SARASMCQSection[];
}

export interface SARASHPTTestResult {
  /**
   * @maxLength 100
   */
  FormID?: string;
  TestScore?: number;
  TotalScore?: number;
  Percentage?: number;
  ResultStatus?: SARASStatus;
  Sections?: SARASHPTSection[];
}

export interface SARASTrialTest {
  Sections?: SARASTrialSection[];
}

export interface SARASSurveyTest {
  Sections?: SARASSurveySection[];
}

export interface SARASHPTSection {
  Name?: string;
  Items?: SARASHPTItemResponse[];

  /**
   * @asType integer
   */
  Order?: number;
  MaxScore?: number;
  TotalScore?: number;
  Percentage?: number;
  /**
   * @format date-time
   */
  StartTime?: string;
  /**
   * @format date-time
   */
  EndTime?: string;
}

export interface SARASMCQSection {
  Name?: string;
  Items?: SARASMCQItemResponse[];

  /**
   * @asType integer
   */
  Order?: number;
  MaxScore?: number;
  TotalScore?: number;
  Percentage?: number;
  /**
   * @format date-time
   */
  StartTime?: string;
  /**
   * @format date-time
   */
  EndTime?: string;
}

export interface SARASSurveySection {
  Name?: string;
  Items?: SARASSurveyItemResponse[];
}

export interface SARASTrialSection {
  Name?: string;
  Items?: SARASTrialItemResponse[];
}

export type SARASSection = SARASHPTSection | SARASMCQSection | SARASSurveySection | SARASTrialSection;

export interface SARASMCQItemResponse {
  Code?: string;
  Type?: SARASItemType;
  Version?: number;
  /**
   * @maxLength 250
   */
  Topic?: string;
  Attempted?: boolean;
  /**
   * @asType integer
   */
  Order?: number;
  /**
   * @asType integer
   */
  TimeSpent?: number;
  Score?: number;
  CorrectChoice?: string[];
  UserResponses?: string[];
}

export interface SARASHPTItemResponse {
  Code?: string;
  Type?: SARASItemType;
  Version?: number;
  /**
   * @maxLength 250
   */
  Topic?: string;
  Attempted?: boolean;
  /**
   * @asType integer
   */
  Order?: number;

  Score?: number;
  /**
   * @asType integer
   */
  FrameRate?: number;
  /**
   * @asType integer
   */
  InappropriateKeyingsInvoked?: number;
  UserResponses?: string[];
  ScoringWindows?: SARASScoringWindow[];
  UsersScore?: SARASUsersScore[];
}

export interface SARASSurveyItemResponse {
  Code?: string;
  Type?: SARASItemType;
  Version?: number;
  /**
   * @maxLength 250
   */
  Topic?: string;
  Attempted?: boolean;
  /**
   * @asType integer
   */
  Order?: number;

  UserResponse?: string[]; // TODO: This is for compat with V2, so can remove in FTT-6670
  UserResponses?: string[];
}

export interface SARASTrialItemResponse {
  Code?: string;
  Type?: SARASItemType;
  Version?: number;
  /**
   * @maxLength 250
   */
  Topic?: string;
  Attempted?: boolean;
  /**
   * @asType integer
   */
  Order?: number;

  UserResponse?: string[]; // TODO: This is for compat with V2, so can remove in FTT-6670
  UserResponses?: string[];
}

export type SARASItemResponse = SARASMCQItemResponse | SARASHPTItemResponse | SARASSurveyItemResponse | SARASTrialItemResponse;

export enum SARASItemType {
  MULTIPLE_CHOICE_STATIC = 0,
  HAZARD_PERCEPTION = 1,
  TRIAL = 2,
  SURVEY = 3,
}

export interface SARASScoringWindow {
  Code?: string;
  /**
   * @asType integer
   */
  StartFrame?: number;
  /**
   * @asType integer
   */
  EndFrame?: number;
  Score?: number;
}

export interface SARASUsersScore {
  Code?: string;
  Score?: number;
}
