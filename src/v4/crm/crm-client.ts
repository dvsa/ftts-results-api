/* eslint-disable no-underscore-dangle, no-void */
import { RequestError } from 'dynamics-web-api';
import { v4 as uuid4 } from 'uuid';

import { newDynamicsWebApi } from './auth/dynamics-web-api';
import { logger, BusinessTelemetryEvent } from '../../shared/utils/logger';
import CRMTestHistory from './test-history/test-history';
import CRMAccommodationAssistant from './accommodation-assistant/accommodation-assistant';
import { CRMTestSection } from './test-section/test-section';
import { CRMSectionType } from './test-section/section-type';
import { CRMTestItem } from './test-item/test-item';
import { mapBookingStatusFromSARAS } from './booking-product/booking-status';
import Remit, { Organisation } from '../../shared/crm/account/remit';
import {
  SARASStatus,
  SARASSection,
  SARASItemResponse,
  DynamicsBookingProductResponse,
} from '../../shared/interfaces';
import { SARASResultQueueRecord } from '../interfaces';
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';
import { getOwnerIdBind } from '../utils/crm-utils';
import { getIdentifiers, getSarasIdentifiers } from '../../shared/utils/identifiers';
import config from '../../shared/config';

type Entity = CRMTestHistory | CRMAccommodationAssistant | CRMTestItem | CRMTestSection;

export class CrmClient {
  private static CRM_ERRORS: Map<number, BusinessTelemetryEvent> = new Map([
    [400, BusinessTelemetryEvent.RES_CONSUMER_CDS_BAD_REQUEST],
    [401, BusinessTelemetryEvent.RES_CONSUMER_CDS_CONNECTIVITY_ISSUE],
    [403, BusinessTelemetryEvent.RES_CONSUMER_CDS_CONNECTIVITY_ISSUE],
    [404, BusinessTelemetryEvent.RES_CONSUMER_CDS_NOT_FOUND],
    [500, BusinessTelemetryEvent.RES_CONSUMER_CDS_INTERNAL_ERROR],
  ]);

  constructor(private dynamicsWebApi: DynamicsWebApi) { }

  public async getBookingProduct(bookingProductRef: string, data: SARASResultQueueRecord): Promise<CRMBookingProduct> {
    try {
      const request: DynamicsWebApi.RetrieveMultipleRequest = {
        collection: 'ftts_bookingproducts',
        filter: `ftts_reference eq '${bookingProductRef}' and ftts_selected eq true`,
        select: ['ftts_bookingproductid', 'ftts_reference', '_ownerid_value', '_owninguser_value', '_owningteam_value', '_ftts_bookingid_value', '_ftts_productid_value'],
        expand: [
          {
            property: 'ftts_ihttcid',
            select: ['ftts_remit'],
          },
          {
            property: 'ftts_bookingid',
            select: ['ftts_owedcompbookingassigned', 'ftts_owedcompbookingrecognised', 'ftts_origin'],
          },
          {
            property: 'ftts_CandidateId',
            select: ['emailaddress1'],
          },
        ],
      };

      logger.debug('CrmClient::getBookingProduct: request to CRM', {
        request,
      });
      const result: DynamicsWebApi.RetrieveMultipleResponse<DynamicsBookingProductResponse> = await this.dynamicsWebApi.retrieveMultipleRequest(request);
      logger.debug('CrmClient::getBookingProduct: response from CRM', {
        result,
      });

      if (result?.value && result.value?.length > 1) {
        throw this.crmNotFoundError(`CrmClient::getBookingProduct: Multiple booking products with reference ${bookingProductRef} - not sure which to assign result to`);
      }

      if (result.value && result.value[0]) {
        return {
          ftts_bookingproductid: result.value[0].ftts_bookingproductid,
          ftts_reference: result.value[0].ftts_reference,
          _ownerid_value: result.value[0]._ownerid_value,
          _owninguser_value: result.value[0]._owninguser_value,
          _owningteam_value: result.value[0]._owningteam_value,
          _ftts_bookingid_value: result.value[0]._ftts_bookingid_value,
          _ftts_productid_value: result.value[0]._ftts_productid_value,
          ftts_ihttcid: result.value[0].ftts_ihttcid,
          ftts_bookingid: result.value[0].ftts_bookingid,
          ftts_CandidateId: {
            emailaddress1: result.value[0].ftts_CandidateId.emailaddress1,
          },
        } as CRMBookingProduct;
      }

      logger.info(`CrmClient::getBookingProduct: Cannot find booking product in CRM with reference - ${bookingProductRef}`);
      throw this.crmNotFoundError(`Booking Product with ref '${bookingProductRef}' not found in CRM`);
    } catch (error) {
      const crmError = error as Error;
      logger.error(crmError, `CrmClient::getBookingProduct: Failed to get booking product from booking product ref - ${bookingProductRef}`, {
        message: crmError.message,
      });
      return this.handleCrmError(error as Error, `Failed to get bookingProduct with ref '${bookingProductRef}' from CRM`, data);
    }
  }

  public async postTestResult(data: SARASResultQueueRecord, testHistoryContentId: string): Promise<CRMBookingProduct> {
    try {
      if (!data.AppointmentId) {
        throw new Error('No Appointment ID Present in Request so unable to get booking product id');
      }

      // Get Booking Product
      const bookingProduct = await this.getBookingProduct(data.AppointmentId, data);
      const productId = bookingProduct._ftts_productid_value;
      const bookingProductId = bookingProduct.ftts_bookingproductid;
      data.bookingProductId = bookingProductId;
      const ownerIdBind = getOwnerIdBind(bookingProduct);

      // Get Remit if Required
      let organisation: Organisation | undefined;
      if (data.TestInformation.OverallStatus === SARASStatus.PASS) {
        organisation = Remit.mapToOrganisation(bookingProduct.ftts_ihttcid.ftts_remit);
      }

      this.dynamicsWebApi.startBatch();

      // Create Test History Request
      const testHistory = new CRMTestHistory(data, productId, ownerIdBind, organisation, bookingProductId);
      this.createRequest(testHistory, 'ftts_testhistories', testHistoryContentId);

      // Create Accommodation Assistant Requests
      const accommodationAssistants = data.AccommodationAssistant;
      if (accommodationAssistants) {
        accommodationAssistants.forEach((assistant): void => {
          const accommodationAssistant = new CRMAccommodationAssistant(assistant, `$${testHistoryContentId}`, ownerIdBind);
          this.createRequest(accommodationAssistant, 'ftts_testaccommodationassistants');
        });
      }

      if (config.featureToggles.writeTestItemsAndSectionsToCRM) {
        const modules = [
          { data: data.MCQTestResult, sectionType: CRMSectionType.MCQ_TEST_RESULT },
          { data: data.HPTTestResult, sectionType: CRMSectionType.HPT_TEST_RESULT },
          { data: data.TrialTest, sectionType: CRMSectionType.TRIAL_TEST },
          { data: data.SurveyTest, sectionType: CRMSectionType.SURVEY_TEST },
        ];
  
        modules.forEach((module) => {
          // Create Test Sections
          const sections = module.data?.Sections || [];
          sections.forEach((section: SARASSection) => {
            const testSectionContentId = uuid4();
            const testSection = new CRMTestSection(section, `$${testHistoryContentId}`, ownerIdBind, module.sectionType);
            this.createRequest(testSection, 'ftts_testsections', testSectionContentId);
            // Create Test Items
            const items = section.Items || [];
            items.forEach((item: SARASItemResponse) => {
              const testItem = new CRMTestItem(item, `$${testSectionContentId}`, ownerIdBind);
              this.createRequest(testItem, 'ftts_testitems');
            });
          });
        });
      }
      
      // Update Booking Status on Booking Product if required
      this.updateBookingStatus(data.TestInformation.OverallStatus, bookingProductId || '');

      await this.dynamicsWebApi.executeBatch();
      logger.info('CrmClient::postTestResult: Successfully posted test results to CRM', {
        ...getIdentifiers(data),
        ownerId: bookingProduct._ownerid_value,
      });

      return bookingProduct;
    } catch (error) {
      logger.error(error as Error, 'CrmClient::postTestResult: Failed to create test result', {
        message: (error as Error).message,
      });
      logger.logEvent(BusinessTelemetryEvent.RES_CONSUMER_CDS_ERROR, 'CrmClient::postTestResult: CRM Error', {
        ...getIdentifiers(data),
        ...getSarasIdentifiers(data),
      });
      return this.handleCrmError(error as Error, 'Results API failed to send the result to CRM', data);
    }
  }

  private updateBookingStatus(status: SARASStatus, appointmentId: string): void {
    if (status === SARASStatus.INCOMPLETE || status === SARASStatus.NOT_STARTED) {
      logger.info(`CrmClient::updateBookingStatus: Not Updating Booking Status on Booking Product with appointment id: ${appointmentId}`, {
        appointmentId,
      });
      return;
    }

    const bookingStatus = mapBookingStatusFromSARAS(status);
    void this.dynamicsWebApi.updateRequest({
      key: appointmentId,
      collection: 'ftts_bookingproducts',
      entity: {
        ftts_bookingstatus: bookingStatus,
      },
    });
    logger.info(`CrmClient::updateBookingStatus: Updating Booking Status on Booking Product ${appointmentId} to ${bookingStatus}`, {
      appointmentId,
      bookingStatus,
    });
  }

  private createRequest(entity: Entity, collection: string, contentId?: string): void {
    void this.dynamicsWebApi.createRequest({ entity, collection, contentId });
  }

  // error might not conform to any known type
  private handleCrmError(error: RequestError, message: string, queueRecord: SARASResultQueueRecord): never {
    if (error.status && CrmClient.CRM_ERRORS.has(error.status)) {
      logger.logEvent(
        CrmClient.CRM_ERRORS.get(error.status) as BusinessTelemetryEvent,
        message,
        {
          ...getIdentifiers(queueRecord),
          ...getSarasIdentifiers(queueRecord),
        },
      );
    }

    throw error;
  }

  private crmNotFoundError(message?: string): RequestError {
    return {
      name: 'Not found in CRM',
      status: 404,
      message: message || 'Resource Not found in CRM',
    };
  }
}

export const newCrmClient = (dynamics: DynamicsWebApi = newDynamicsWebApi()): CrmClient => new CrmClient(dynamics);
