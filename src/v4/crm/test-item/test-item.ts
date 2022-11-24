import { CRMItemType, CRMItemTypes } from './item-type';
import {
  SARASHPTItemResponse, SARASItemResponse, SARASMCQItemResponse,
} from '../../../shared/interfaces';

export class CRMTestItem {
  public ftts_name: string;

  public 'ftts_Testsection@odata.bind': string;

  public ftts_code?: string;

  public ftts_attempted?: boolean;

  public ftts_order?: number;

  public ftts_userresponses?: string;

  public ftts_type?: CRMItemTypes;

  public ftts_version?: number;

  public ftts_topic?: string;

  public ftts_score?: number;

  public ftts_timespent?: number;

  public ftts_correctchoice?: string;

  public ftts_framerate?: number;

  public ftts_inappropriatekeyingsinvoked?: number;

  public ftts_scoringwindows?: string;

  public ftts_userscore?: string;

  'ownerid@odata.bind': string;

  constructor(item: SARASItemResponse, sectionId: string, ownerIdBind: string) {
    this.ftts_name = `${CRMItemType.getItemTypeLabel(item.Type)} - ${item.Order || ''} - ${item.Code || ''}`;
    this['ftts_Testsection@odata.bind'] = sectionId;
    this.ftts_code = item.Code;
    this.ftts_attempted = item.Attempted;
    this.ftts_order = item.Order;
    this.ftts_userresponses = item.UserResponses?.toString();
    this.ftts_type = CRMItemType.mapFromSARAS(item.Type);
    this.ftts_version = item.Version;
    this.ftts_topic = item.Topic;
    this.ftts_score = (item as SARASMCQItemResponse).Score;
    this.ftts_timespent = (item as SARASMCQItemResponse).TimeSpent;
    this.ftts_correctchoice = (item as SARASMCQItemResponse).CorrectChoice?.toString();
    this.ftts_framerate = (item as SARASHPTItemResponse).FrameRate;
    this.ftts_inappropriatekeyingsinvoked = (item as SARASHPTItemResponse).InappropriateKeyingsInvoked;
    this.ftts_scoringwindows = JSON.stringify((item as SARASHPTItemResponse).ScoringWindows);
    this.ftts_userscore = JSON.stringify((item as SARASHPTItemResponse).UsersScore);
    this['ownerid@odata.bind'] = ownerIdBind;
  }
}
