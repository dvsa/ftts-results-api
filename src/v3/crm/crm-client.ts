/* eslint-disable no-void */
import { RequestError } from 'dynamics-web-api';
import { v4 as uuid4 } from 'uuid';

import { newDynamicsWebApi } from './auth/dynamics-web-api';
import { logger, getIdentifiers, BusinessTelemetryEvent } from '../../shared/utils/logger';
import CRMTestHistory from './test-history/test-history';
import CRMAccommodationAssistant from './accommodation-assistant/accommodation-assistant';
import { CRMTestSection } from './test-section/test-section';
import { CRMSectionType } from './test-section/section-type';
import { CRMTestItem } from './test-item/test-item';
import { mapBookingStatusFromSARAS } from './booking-product/booking-status';
import Remit, { Organisation } from './account/remit';
import {
  DynamicsProductResponse,
  SARASTestType,
  SARASStatus,
  SARASSection,
  SARASItemResponse,
  DynamicsRemitResponse,
  DynamicsBookingProductIdResponse,
  DynamicsBookingProductResponse,
} from '../../shared/interfaces';
import { QueueRecord } from '../interfaces';
import { CRMBookingProduct } from './booking-product/interfaces';

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

  public async getProductId(testType: SARASTestType): Promise<string> {
    try {
      const result: DynamicsWebApi.RetrieveMultipleResponse<DynamicsProductResponse> = await this.dynamicsWebApi.retrieveMultipleRequest({
        collection: 'products',
        filter: `ftts_testenginetesttype eq ${testType}`,
        select: ['productid'],
      });

      if (result.value && result.value[0]) {
        return result.value[0].productid;
      }
      throw this.crmNotFoundError('Product Id not found in CRM');
    } catch (error) {
      logger.error(error, `CrmClient::getProductId:: Failed to get product id for SARAS test type ${testType}`);
      return this.handleCrmError(error, 'Failed to get product id from CRM');
    }
  }

  public async getRemit(testCentreCode: string): Promise<Organisation> {
    try {
      const result: DynamicsWebApi.RetrieveMultipleResponse<DynamicsRemitResponse> = await this.dynamicsWebApi.retrieveMultipleRequest({
        collection: 'accounts',
        filter: `ftts_testenginetestcentrecode eq '${testCentreCode}'`,
        select: ['ftts_remit'],
      });
      if (result.value && result.value[0]) {
        return Remit.mapToOrganisation(result.value[0].ftts_remit);
      }
      throw this.crmNotFoundError('Remit not found in CRM');
    } catch (error) {
      logger.error(error, `CrmClient::getRemit:: Failed to get remit for test centre code ${testCentreCode}`);
      return this.handleCrmError(error, 'Failed to get remit from CRM');
    }
  }

  public async getBookingProduct(bookingRef: string): Promise<CRMBookingProduct> {
    try {
      const result: DynamicsWebApi.RetrieveMultipleResponse<DynamicsBookingProductResponse> = await this.dynamicsWebApi.retrieveMultipleRequest({
        collection: 'ftts_bookingproducts',
        filter: `ftts_reference eq '${bookingRef}'`,
        select: ['ftts_bookingproductid', 'ftts_reference', '_ownerid_value'],
      });
      if (result.value && result.value[0]) {
        return {
          ftts_bookingproductid: result.value[0].ftts_bookingproductid,
          ftts_reference: result.value[0].ftts_reference,
          // eslint-disable-next-line no-underscore-dangle
          _ownerid_value: result.value[0]._ownerid_value,
        } as CRMBookingProduct;
      }
      throw this.crmNotFoundError('Booking Product not found in CRM');
    } catch (error) {
      logger.error(error, `CrmClient::getBookingProduct:: Failed to get booking product from booking ref - ${bookingRef}`);
      return this.handleCrmError(error, 'Failed to get bookingProduct from CRM');
    }
  }

  public async getBookingProductId(bookingRef: string): Promise<string> {
    try {
      const result: DynamicsWebApi.RetrieveMultipleResponse<DynamicsBookingProductIdResponse> = await this.dynamicsWebApi.retrieveMultipleRequest({
        collection: 'ftts_bookingproducts',
        filter: `ftts_reference eq '${bookingRef}'`,
        select: ['ftts_bookingproductid'],
      });
      if (result.value && result.value[0]) {
        return result.value[0].ftts_bookingproductid;
      }
      throw this.crmNotFoundError('Booking Product Id not found in CRM');
    } catch (error) {
      logger.error(error, `CrmClient::getBookingProductId:: Failed to get booking product id from booking ref - ${bookingRef}`);
      return this.handleCrmError(error, 'Failed to get bookingProductId from CRM');
    }
  }

  public async postTestResult(data: QueueRecord): Promise<void> {
    try {
      // Get Product ID
      const productId = await this.getProductId(data.TestInformation.TestType);

      // Get Booking Product Id
      if (!data.AppointmentId) {
        throw new Error('No Appointment ID Present in Request so unable to get booking product id');
      }
      const bookingProduct = await this.getBookingProduct(data.AppointmentId);
      const bookingProductId = bookingProduct.ftts_bookingproductid;
      data.bookingProductId = bookingProductId;
      // eslint-disable-next-line no-underscore-dangle
      const ownerId = bookingProduct._ownerid_value;

      // Get Remit if Required
      let organisation: Organisation | undefined;
      if (data.TestInformation.OverallStatus === SARASStatus.PASS) {
        organisation = await this.getRemit(data.TestCentre.TestCentreCode);
      }

      this.dynamicsWebApi.startBatch();

      // Create Test History Request
      const testHistoryContentId = uuid4();
      const testHistory = new CRMTestHistory(data, productId, ownerId, organisation, bookingProductId);
      this.createRequest(testHistory, 'ftts_testhistories', testHistoryContentId);

      // Create Accommodation Assistant Requests
      const accommodationAssistants = data.AccommodationAssistant;
      if (accommodationAssistants) {
        accommodationAssistants.forEach((assistant): void => {
          const accommodationAssistant = new CRMAccommodationAssistant(assistant, `$${testHistoryContentId}`, ownerId);
          this.createRequest(accommodationAssistant, 'ftts_testaccommodationassistants');
        });
      }

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
          const testSection = new CRMTestSection(section, `$${testHistoryContentId}`, ownerId, module.sectionType);
          this.createRequest(testSection, 'ftts_testsections', testSectionContentId);
          // Create Test Items
          const items = section.Items || [];
          items.forEach((item: SARASItemResponse) => {
            const testItem = new CRMTestItem(item, `$${testSectionContentId}`, ownerId);
            this.createRequest(testItem, 'ftts_testitems');
          });
        });
      });

      // Update Booking Status on Booking Product if required
      this.updateBookingStatus(data.TestInformation.OverallStatus, bookingProductId || '');

      await this.dynamicsWebApi.executeBatch();
      logger.info(`Successfully posted test results to CRM ${getIdentifiers(data)}, ownerId: ${ownerId}`);
    } catch (error) {
      logger.error(error, 'CrmClient::postTestResult:: Failed to create test result');
      logger.info(`CrmClient::postTestResultParsed:: ${JSON.stringify(error)}`);
      this.handleCrmError(error, 'Results API failed to send the result to CRM');
    }
  }

  private updateBookingStatus(status: SARASStatus, appointmentId: string): void {
    if (status === SARASStatus.INCOMPLETE || status === SARASStatus.NOT_STARTED) {
      logger.info(`Not Updating Booking Status on Booking Product ${appointmentId}`);
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
    logger.info(`Updating Booking Status on Booking Product ${appointmentId} to ${bookingStatus}`);
  }

  private createRequest(entity: Entity, collection: string, contentId?: string): void {
    void this.dynamicsWebApi.createRequest({ entity, collection, contentId });
  }

  // error might not conform to any known type
  private handleCrmError(error: RequestError, message: string): never {
    if (error.status && CrmClient.CRM_ERRORS.has(error.status)) {
      logger.logEvent(
        CrmClient.CRM_ERRORS.get(error.status) as BusinessTelemetryEvent,
        message,
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
