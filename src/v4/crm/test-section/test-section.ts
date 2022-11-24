/* eslint-disable @typescript-eslint/no-explicit-any */
import { SARASMCQSection, SARASSection } from '../../../shared/interfaces';
import { CRMSectionType, getSectionTypeLabel } from './section-type';

export class CRMTestSection {
  ftts_name?: string;

  ftts_sectionname?: string;

  ftts_sectiontype?: string;

  ftts_order?: number;

  ftts_maxscore?: number;

  ftts_totalscore?: number;

  ftts_percentage?: number;

  ftts_starttime?: string;

  ftts_endtime?: string;

  'ftts_Testhistory@odata.bind': string;

  'ownerid@odata.bind': string;

  constructor(sarasSection: SARASSection, testHistoryId: string, ownerIdBind: string, sectionType: CRMSectionType) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.ftts_name = `${getSectionTypeLabel(sectionType)} - ${(sarasSection as SARASMCQSection).Order} - ${sarasSection.Name}`;
    this.ftts_sectionname = sarasSection.Name;
    this.ftts_sectiontype = sectionType.toString();
    this.ftts_order = (sarasSection as SARASMCQSection).Order;
    this.ftts_maxscore = (sarasSection as SARASMCQSection).MaxScore;
    this.ftts_totalscore = (sarasSection as SARASMCQSection).TotalScore;
    this.ftts_percentage = (sarasSection as SARASMCQSection).Percentage;
    this.ftts_starttime = (sarasSection as SARASMCQSection).StartTime;
    this.ftts_endtime = (sarasSection as SARASMCQSection).EndTime;
    this['ftts_Testhistory@odata.bind'] = testHistoryId;
    this['ownerid@odata.bind'] = ownerIdBind;
  }
}
