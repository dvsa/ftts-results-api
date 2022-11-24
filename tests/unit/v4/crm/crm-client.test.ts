/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { mockedLogger } from '../../../mocks/logger.mock';
import * as CRM from '../../../../src/v4/crm/crm-client';
import { queueRecord } from '../../../mocks/result-records';
import { CRMRemit } from '../../../../src/shared/crm/account/remit';
import { SARASStatus } from '../../../../src/shared/interfaces';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { BusinessTelemetryEvent } from '../../../../src/shared/utils/logger';
import { mockCompensationBookingProduct } from '../../../mocks/crm-records';
import config from '../../../../src/shared/config';

const testHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';

describe('CrmClient', () => {
  const crmErrors = [
    [400, BusinessTelemetryEvent.RES_CONSUMER_CDS_BAD_REQUEST],
    [401, BusinessTelemetryEvent.RES_CONSUMER_CDS_CONNECTIVITY_ISSUE],
    [403, BusinessTelemetryEvent.RES_CONSUMER_CDS_CONNECTIVITY_ISSUE],
    [404, BusinessTelemetryEvent.RES_CONSUMER_CDS_NOT_FOUND],
    [500, BusinessTelemetryEvent.RES_CONSUMER_CDS_INTERNAL_ERROR],
  ];
  let crmClient: CRM.CrmClient;
  let mockDynamics = {
    createRequest: jest.fn(),
    executeBatch: jest.fn(),
    getProductId: jest.fn(),
    retrieveMultipleRequest: jest.fn().mockImplementationOnce(() => Promise.resolve({ value: [{ productid: 'test-product-id' }] })),
    startBatch: jest.fn(),
    updateRequest: jest.fn(),
  };

  beforeEach(() => {
    crmClient = CRM.newCrmClient(mockDynamics as unknown as DynamicsWebApi);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getBookingProduct', () => {
    test('Successfully returns a booking product', async () => {
      mockDynamics.retrieveMultipleRequest = jest.fn().mockImplementation(() => ({
        value: [mockCompensationBookingProduct()],
      }));

      const result = await crmClient.getBookingProduct('REF-001', queueRecord());

      expect(result).toStrictEqual({
        ftts_bookingproductid: 'mockBookingProductId',
        ftts_reference: 'REF-001',
        _ownerid_value: '87559',
        _owninguser_value: '54353',
        _owningteam_value: '87559',
        _ftts_bookingid_value: 'mockBookingId',
        _ftts_productid_value: 'mockProductId',
        ftts_CandidateId: {
          emailaddress1: 'mock@email.com',
        },
        ftts_ihttcid: {
          accountid: 'testCentreId',
          ftts_remit: CRMRemit.DVSA_ENGLAND,
        },
        ftts_bookingid: {
          ftts_owedcompbookingassigned: '2021-09-06T10:21:12.889Z',
          ftts_owedcompbookingrecognised: null,
          ftts_origin: 1,
        },
      });
    });

    test('Handles getting no results from CRM', async () => {
      mockDynamics.retrieveMultipleRequest = jest.fn().mockImplementation(() => ({
        value: [],
      }));

      await expect(crmClient.getBookingProduct('REF-001', queueRecord()))
        .rejects.toEqual({ message: 'Booking Product with ref \'REF-001\' not found in CRM', name: 'Not found in CRM', status: 404 });
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test('Handles getting more than one booking product with the same booking product ref from CRM', async () => {
      const bookingProductOne = mockCompensationBookingProduct();
      const bookingProductTwo = mockCompensationBookingProduct();
      bookingProductTwo.ftts_bookingproductid = 'mockBookingProductIdTwo';
      bookingProductTwo._ownerid_value = '547523';
      bookingProductTwo._owninguser_value = '45637';
      bookingProductTwo._owninguser_value = '88474';

      mockDynamics.retrieveMultipleRequest = jest.fn().mockImplementation(() => ({
        value: [
          bookingProductOne,
          bookingProductTwo,
        ],
      }));

      await expect(crmClient.getBookingProduct('REF-001', queueRecord()))
        .rejects.toEqual({
          message: 'CrmClient::getBookingProduct: Multiple booking products with reference REF-001 - not sure which to assign result to',
          name: 'Not found in CRM',
          status: 404,
        });
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test('Handles generic errors', async () => {
      const error = 'Request Failed';
      mockDynamics.retrieveMultipleRequest = jest.fn().mockRejectedValue(error);

      await expect(crmClient.getBookingProduct('REF-001', queueRecord())).rejects.toEqual(error);
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      mockDynamics.retrieveMultipleRequest = jest.fn().mockRejectedValue(error);

      await expect(crmClient.getBookingProduct('REF-001', queueRecord())).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Failed to get bookingProduct with ref \'REF-001\' from CRM', {
        appointmentId: 'mockAppointmentId',
        candidateId: 'mockCandidateId',
        context_id: 'mockContextId',
        reference: 'mockReference',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        trace_id: 'testTraceId',
      });
    });
  });

  describe('postTestResult', () => {
    let data: SARASResultQueueRecord;

    beforeEach(() => {
      mockDynamics = {
        createRequest: jest.fn(),
        executeBatch: jest.fn(),
        getProductId: jest.fn(),
        retrieveMultipleRequest: jest.fn().mockReturnValue(Promise.resolve({ value: [mockCompensationBookingProduct()] })),
        startBatch: jest.fn(),
        updateRequest: jest.fn(),
      };

      crmClient = CRM.newCrmClient(mockDynamics as unknown as DynamicsWebApi);
      data = queueRecord();
    });

    describe('Build and execute the request and update the booking product if test is pass', () => {
      test('toggle WRITE_TEST_ITEMS_AND_SECTIONS_TO_CRM is off', async () => {
        config.featureToggles.writeTestItemsAndSectionsToCRM = false;
        mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
        data.TestInformation.OverallStatus = SARASStatus.PASS;

        await crmClient.postTestResult(data, testHistoryId);

        expect(mockDynamics.startBatch).toHaveBeenCalled();
        expect(mockDynamics.createRequest).toHaveBeenCalledTimes(2);
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testhistories' }));
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testaccommodationassistants' }));
        expect(mockDynamics.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
        expect(mockDynamics.executeBatch).toHaveBeenCalled();
      });

      test('toggle WRITE_TEST_ITEMS_AND_SECTIONS_TO_CRM is on', async () => {
        config.featureToggles.writeTestItemsAndSectionsToCRM = true;
        mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
        data.TestInformation.OverallStatus = SARASStatus.PASS;

        await crmClient.postTestResult(data);

        expect(mockDynamics.startBatch).toHaveBeenCalled();
        expect(mockDynamics.createRequest).toHaveBeenCalledTimes(10);
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testhistories' }));
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testaccommodationassistants' }));
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testsections' }));
        expect(mockDynamics.createRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_testitems' }));
        expect(mockDynamics.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
        expect(mockDynamics.executeBatch).toHaveBeenCalled();
      });
    });


    test('Should update the booking product if the test is a fail', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.FAIL;

      await crmClient.postTestResult(data, testHistoryId);

      expect(mockDynamics.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Should not update the booking product if overall status is incomplete', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.INCOMPLETE;

      await crmClient.postTestResult(data, testHistoryId);

      expect(mockDynamics.updateRequest).not.toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Should not update the booking product if overall status is not started', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.NOT_STARTED;

      await crmClient.postTestResult(data, testHistoryId);

      expect(mockDynamics.updateRequest).not.toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Handles generic errors', async () => {
      mockDynamics.executeBatch.mockRejectedValueOnce('Error');

      await expect(crmClient.postTestResult(data, testHistoryId)).rejects.toBe('Error');

      expect(mockedLogger.error).toHaveBeenCalledWith('Error', 'CrmClient::postTestResult: Failed to create test result', expect.objectContaining({}));
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(BusinessTelemetryEvent.RES_CONSUMER_CDS_ERROR, 'CrmClient::postTestResult: CRM Error', {
        appointmentId: 'mockAppointmentId',
        candidateId: 'mockCandidateId',
        context_id: 'mockContextId',
        reference: 'mockReference',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        trace_id: 'testTraceId',
      });
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      mockDynamics.executeBatch.mockRejectedValueOnce(error);

      await expect(crmClient.postTestResult(data, testHistoryId)).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Results API failed to send the result to CRM', {
        appointmentId: 'mockAppointmentId',
        candidateId: 'mockCandidateId',
        context_id: 'mockContextId',
        reference: 'mockReference',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        trace_id: 'testTraceId',
      });
    });

    test('Should throw an error if there is no appointment id in the data', async () => {
      delete data.AppointmentId;

      await expect(crmClient.postTestResult(data, testHistoryId)).rejects.toEqual(Error('No Appointment ID Present in Request so unable to get booking product id'));
      expect(mockedLogger.error).toHaveBeenCalled();
    });
  });
});
