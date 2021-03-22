/* eslint-disable @typescript-eslint/no-unsafe-call */
import { mockedLogger } from '../../../mocks/logger.mock';
import * as CRM from '../../../../src/v3/crm/crm-client';
import { queueRecord } from '../../../mocks/result-records';
import { Organisation, CRMRemit } from '../../../../src/v3/crm/account/remit';
import { SARASStatus, SARASTestType } from '../../../../src/shared/interfaces';
import { QueueRecord } from '../../../../src/v3/interfaces';
import { BusinessTelemetryEvent } from '../../../../src/shared/utils/logger';

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
    jest.clearAllMocks();
  });

  describe('getProductId', () => {
    test('Sucessfully returns a product id', async () => {
      mockDynamics.retrieveMultipleRequest.mockResolvedValue({ value: [{ productid: 'test-product-id' }] });

      const result = await crmClient.getProductId(SARASTestType.CAR);

      expect(result).toEqual('test-product-id');
    });

    test('Handles generic errors', async () => {
      const error = 'Request Failed';
      mockDynamics.retrieveMultipleRequest.mockRejectedValue(error);

      await expect(crmClient.getProductId(SARASTestType.CAR)).rejects.toEqual(error);
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test('No results throws 404 error not found', async () => {
      mockDynamics.retrieveMultipleRequest.mockResolvedValueOnce({ value: [] });
      const unknownTestType = 99999;

      await expect(crmClient.getProductId(unknownTestType)).rejects.toEqual(expect.objectContaining({
        status: 404,
      }));
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      mockDynamics.retrieveMultipleRequest.mockRejectedValueOnce(error);

      await expect(crmClient.getProductId(SARASTestType.CAR)).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Failed to get product id from CRM');
    });
  });

  describe('getRemit', () => {
    test('Sucessfully returns an organisation', async () => {
      mockDynamics.retrieveMultipleRequest.mockResolvedValue({ value: [{ ftts_remit: CRMRemit.DVSA_ENGLAND }] });

      const result = await crmClient.getRemit('CENTRE-001');

      expect(result).toEqual(Organisation.DVSA);
    });

    test('Handles generic errors', async () => {
      const error = 'Request Failed';
      mockDynamics.retrieveMultipleRequest.mockRejectedValue(error);

      await expect(crmClient.getRemit('CENTRE-001')).rejects.toEqual(error);
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      mockDynamics.retrieveMultipleRequest.mockRejectedValueOnce(error);

      await expect(crmClient.getRemit('CENTRE-001')).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Failed to get remit from CRM');
    });
  });

  describe('getBookingProductId', () => {
    test('Sucessfully returns an booking product id', async () => {
      mockDynamics.retrieveMultipleRequest.mockResolvedValue({ value: [{ ftts_bookingproductid: '123456' }] });

      const result = await crmClient.getBookingProductId('REF-001');

      expect(result).toEqual('123456');
    });

    test('Handles generic errors', async () => {
      const error = 'Request Failed';
      mockDynamics.retrieveMultipleRequest.mockRejectedValue(error);

      await expect(crmClient.getBookingProductId('REF-001')).rejects.toEqual(error);
      expect(mockedLogger.error).toHaveBeenCalled();
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      mockDynamics.retrieveMultipleRequest.mockRejectedValueOnce(error);

      await expect(crmClient.getBookingProductId('REF-001')).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Failed to get bookingProductId from CRM');
    });
  });

  describe('postTestResult', () => {
    let data: QueueRecord;

    beforeEach(() => {
      mockDynamics = {
        createRequest: jest.fn(),
        executeBatch: jest.fn(),
        getProductId: jest.fn(),
        retrieveMultipleRequest: jest.fn().mockImplementationOnce(() => Promise.resolve({ value: [{ productid: 'test-product-id' }] })),
        startBatch: jest.fn(),
        updateRequest: jest.fn(),
      };

      crmClient = CRM.newCrmClient(mockDynamics as unknown as DynamicsWebApi);

      crmClient.getProductId = jest.fn().mockReturnValue(Promise.resolve('123456'));
      crmClient.getBookingProductId = jest.fn().mockReturnValue(Promise.resolve('123456'));
      data = queueRecord();
    });

    test('Build and execute the request and update the booking product if test is pass', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.PASS;
      crmClient.getRemit = jest.fn().mockReturnValue(Promise.resolve(Organisation.DVSA));

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

    test('Should update the booking product if the test is a fail', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.FAIL;

      await crmClient.postTestResult(data);

      expect(mockDynamics.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Should not update the booking product if overall status is incomplete', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.INCOMPLETE;

      await crmClient.postTestResult(data);

      expect(mockDynamics.updateRequest).not.toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Should not update the booking product if overall status is not started', async () => {
      mockDynamics.executeBatch.mockReturnValue(Promise.resolve([]));
      data.TestInformation.OverallStatus = SARASStatus.NOT_STARTED;

      await crmClient.postTestResult(data);

      expect(mockDynamics.updateRequest).not.toHaveBeenCalledWith(expect.objectContaining({ collection: 'ftts_bookingproducts' }));
    });

    test('Handles generic errors', async () => {
      const getBookingProductIdSpy = jest.spyOn(CRM.CrmClient.prototype, 'getBookingProductId');
      getBookingProductIdSpy.mockImplementationOnce(() => Promise.resolve('test-booking-product-id'));
      const getRemit = jest.spyOn(CRM.CrmClient.prototype, 'getRemit');
      getRemit.mockImplementationOnce(() => Promise.resolve(Organisation.DVSA));
      mockDynamics.retrieveMultipleRequest.mockResolvedValueOnce({ value: [{ productid: 'test-product-id' }] });
      mockDynamics.executeBatch.mockRejectedValueOnce('Error');

      await expect(crmClient.postTestResult(data)).rejects.toEqual('Error');
      expect(mockedLogger.error).toHaveBeenCalledWith('Error', 'CrmClient::postTestResult:: Failed to create test result');
    });

    test.each(crmErrors)('Handles %p errors', async (status, event) => {
      const error = { status };
      const getBookingProductIdSpy = jest.spyOn(CRM.CrmClient.prototype, 'getBookingProductId');
      getBookingProductIdSpy.mockImplementationOnce(() => Promise.resolve('test-booking-product-id'));
      const getRemit = jest.spyOn(CRM.CrmClient.prototype, 'getRemit');
      getRemit.mockImplementationOnce(() => Promise.resolve(Organisation.DVSA));
      mockDynamics.retrieveMultipleRequest.mockResolvedValueOnce({ value: [{ productid: 'test-product-id' }] });
      mockDynamics.executeBatch.mockRejectedValueOnce(error);

      await expect(crmClient.postTestResult(data)).rejects.toEqual(error);
      expect(mockedLogger.logEvent).toHaveBeenCalledWith(event, 'Results API failed to send the result to CRM');
    });

    test('Should throw an error if there is no appointment id in the data', async () => {
      delete data.AppointmentId;

      await expect(crmClient.postTestResult(data)).rejects.toEqual(Error('No Appointment ID Present in Request so unable to get booking product id'));
      expect(mockedLogger.error).toHaveBeenCalled();
    });
  });
});
