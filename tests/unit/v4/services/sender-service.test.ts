import { mocked } from 'ts-jest/utils';
import { CRMBookingProduct } from '../../../../src/shared/crm/booking-product/interfaces';
import { SARASStatus, SARASTestType } from '../../../../src/shared/interfaces';
import { BusinessTelemetryEvent, logger } from '../../../../src/shared/utils/logger';
import { QueueRecordServiceBusMessage } from '../../../../src/v4/interfaces';
import { CrmService, QueueService } from '../../../../src/v4/services';
import SenderService from '../../../../src/v4/services/sender-service';
import { QueueRecordValidator } from '../../../../src/v4/utils/queue-record-validator';
import { mockedConfig as config } from '../../../mocks/config.mock';
import { mockBookingProduct, mockCompensationBookingProduct } from '../../../mocks/crm-records';
import { queueRecord } from '../../../mocks/result-records';

const mockedTestHistoryId = 'afe6bcd4-ba67-4ee0-8b4a-b1ec92fe5f88';
jest.mock('uuid', () => ({ v4: () => mockedTestHistoryId }));
jest.mock('@azure/service-bus');
jest.mock('../../../../src/v4/services/crm-service');
jest.mock('../../../../src/v4/services/queue-service');
jest.mock('../../../../src/v4/queues/arrival-queue');
jest.mock('../../../../src/v4/utils/queue-record-validator');
jest.mock('../../../../src/shared/config');

const mockedCrmService = mocked(CrmService, true);
const mockedQueueService = mocked(QueueService, true);
const mockedQueueRecordValidator = mocked(QueueRecordValidator, true);

describe('Sender Service', () => {
  const record = queueRecord();
  const bookingProduct = mockBookingProduct();
  let serviceBusMessage: Partial<QueueRecordServiceBusMessage>;

  beforeEach(() => {
    serviceBusMessage = {
      body: record,
      applicationProperties: {
        sentToCrmAt: undefined,
      },
    };
    config.featureToggles.digitalResultsEmailInfo = true;
  });

  afterEach(() => {
    jest.resetAllMocks();

    if (serviceBusMessage.body) {
      serviceBusMessage.body.TestInformation.OverallStatus = SARASStatus.PASS;
    }
  });

  test('successfully sends the result', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).toHaveBeenCalledWith(record, bookingProduct);
  });

  test('should not send the result to digital results if the digitalResultsEmailInfo feature toggle is false', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.digitalResultsEmailInfo = false;
    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).not.toHaveBeenCalledWith(record, bookingProduct);
  });

  test('should not send the result to test results persister if the testResultPersister feature toggle is false', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.testResultPersister = false;
    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).toHaveBeenCalledWith(record, bookingProduct);
    expect(mockedQueueService.sendTestResultsToPersister).not.toHaveBeenCalled();
  });

  test('should send the result and testHistoryContentId test to test results persister if the testResultPersister feature toggle is true', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.testResultPersister = true;
    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).toHaveBeenCalledWith(record, bookingProduct);
    expect(mockedQueueService.sendTestResultsToPersister).toHaveBeenCalledWith(record, mockedTestHistoryId);
  });

  test('should not send the result to digital results if the result is anything other than PASS or FAIL', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    if (serviceBusMessage.body) {
      serviceBusMessage.body.TestInformation.OverallStatus = SARASStatus.INCOMPLETE;
    }

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).not.toHaveBeenCalledWith(record, bookingProduct);
  });

  test.each([
    ['Customer Service Centre', 2],
    ['IHTTC Portal', 3],
    ['Trainer Booker Portal', 4],
  ])('should not send the result to digital results if booking comes from %s', async (name: string, origin: number) => {
    const booking = { ...bookingProduct.ftts_bookingid, ftts_origin: origin };
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve({ ...bookingProduct, ftts_bookingid: booking }));

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).not.toHaveBeenCalledWith(record, bookingProduct);
  });

  test('should throw an error if booking origin is not defined', async () => {
    const booking = { ...bookingProduct.ftts_bookingid, ftts_origin: undefined };
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve({ ...bookingProduct, ftts_bookingid: booking } as unknown as CRMBookingProduct));

    await expect(SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage)).rejects.toThrow(new Error('SenderService::sendResult: unknown booking origin'));
  });

  test('throws error if result payload has a validation error', async () => {
    const error = new Error('validation error');
    mockedQueueRecordValidator.validateResultQueueRecord.mockImplementation(() => {
      throw error;
    });
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));

    await expect(() => SenderService.sendResult(serviceBusMessage as any as QueueRecordServiceBusMessage))
      .rejects
      .toThrow('result failed validation validation error');

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
  });

  test('throws error if fails to send to crm', async () => {
    const error = new Error('crm error');
    mockedCrmService.sendResultToCrm.mockImplementation(() => {
      throw error;
    });

    await expect(() => SenderService.sendResult(serviceBusMessage as any as QueueRecordServiceBusMessage))
      .rejects
      .toThrow('failed to send result to crm crm error');

    expect(QueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(CrmService.sendResultToCrm).toHaveBeenCalled();
  });

  test('skips sending to CRM if it has been done already on a previous attempt', async () => {
    const message = { ...serviceBusMessage };
    message.applicationProperties.sentToCrmAt = '2022-02-02T12:20:56.041Z';
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));

    await expect(() => SenderService.sendResult(message as QueueRecordServiceBusMessage))
      .rejects
      .toThrow('SenderService::sendResult: unknown booking origin');

    expect(logger.info).toHaveBeenCalledWith('SenderService::sendResult: Result has already been sent to crm', {
      appointmentId: 'mockAppointmentId',
      candidateId: 'mockCandidateId',
      context_id: 'mockContextId',
      reference: 'mockReference',
      sentToCrmAt: '2022-02-02T12:20:56.041Z',
      trace_id: 'testTraceId',
    });
  });

  test('if booking is a compensation booking - log an event', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockCompensationBookingProduct()));

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(QueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvent.RES_BOOKING_PRODUCT_OWED_COMPENSATION_BOOKING,
      'SenderService::processResultsQueueMessage: Is owed compensation booking, not sending result to payments queue',
      {
        appointmentId: 'mockAppointmentId',
        bookingProductId: 'mockBookingProductId',
        bookingProductReference: 'REF-001',
        candidateId: 'mockCandidateId',
        context_id: 'mockContextId',
        reference: 'mockReference',
        trace_id: 'testTraceId',
      },
    );
    expect(QueueService.sendResultStatusToPaymentsQueue).not.toHaveBeenCalled();
  });

  test('throws error if fails to add result to payments queue', async () => {
    const error = new Error('queue error');
    mockedQueueService.sendResultStatusToPaymentsQueue.mockImplementation(() => {
      throw error;
    });
    mockedCrmService.sendResultToCrm.mockResolvedValue(mockBookingProduct());

    await expect(() => SenderService.sendResult(serviceBusMessage as any as QueueRecordServiceBusMessage))
      .rejects
      .toThrow('failed to send to payments queue queue error');

    expect(QueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(QueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(serviceBusMessage.body);
  });

  test('should throw error if fails to add result to digital results queue', async () => {
    const error = new Error('fake error');
    mockedQueueService.sendResultToDigitalResultsQueue.mockImplementation(() => {
      throw error;
    });
    mockedCrmService.sendResultToCrm.mockResolvedValue(mockBookingProduct());

    await expect(() => SenderService.sendResult(serviceBusMessage as any as QueueRecordServiceBusMessage))
      .rejects
      .toThrow(new Error('SenderService::sendToDigitalResultsQueue: failed to send to DigitalResults queue fake error'));

    expect(QueueService.sendResultToDigitalResultsQueue).toHaveBeenCalledWith(serviceBusMessage.body, bookingProduct);
  });

  test('should throw error if fails to add result to test results queue', async () => {
    const error = new Error('fake error');
    mockedQueueService.sendTestResultsToPersister.mockImplementation(() => {
      throw error;
    });
    mockedCrmService.sendResultToCrm.mockResolvedValue(mockBookingProduct());

    await expect(() => SenderService.sendResult(serviceBusMessage as any as QueueRecordServiceBusMessage))
      .rejects
      .toThrow(new Error('SenderService::sendToTestResultPersisterQueue: failed to send to TR Persister queue fake error'));

    expect(QueueService.sendTestResultsToPersister).toHaveBeenCalledWith(serviceBusMessage.body, mockedTestHistoryId);
  });

  test('should send the result to digital results queue if the digitalResultsDisabledTestTypes feature toggle is empty', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.digitalResultsEmailInfo = true;
    config.featureToggles.digitalResultsDisabledTestTypes = '';

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).toHaveBeenCalledWith(record, bookingProduct);
  });

  test('should not send the result to digital results queue if the digitalResultsDisabledTestTypes contains used test type', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.digitalResultsEmailInfo = true;
    config.featureToggles.digitalResultsDisabledTestTypes = 'MOTORCYCLE,PCVMC,AMI1';

    if (serviceBusMessage.body) {
      serviceBusMessage.body.TestInformation.TestType = SARASTestType.PCVMC;
    }

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).not.toHaveBeenCalled();
  });

  test('should not send the result to digital results queue if test type is unknown', async () => {
    mockedCrmService.sendResultToCrm.mockImplementation(() => Promise.resolve(mockBookingProduct()));
    config.featureToggles.digitalResultsEmailInfo = true;
    config.featureToggles.digitalResultsDisabledTestTypes = 'MOTORCYCLE,PCVMC,AMI1';

    if (serviceBusMessage.body) {
      serviceBusMessage.body.TestInformation.TestType = 25 as SARASTestType;
    }

    await SenderService.sendResult(serviceBusMessage as QueueRecordServiceBusMessage);

    expect(mockedQueueRecordValidator.validateResultQueueRecord).toHaveBeenCalledWith(record);
    expect(mockedCrmService.sendResultToCrm).toHaveBeenCalledWith(record, mockedTestHistoryId);
    expect(mockedQueueService.sendResultStatusToPaymentsQueue).toHaveBeenCalledWith(record);
    expect(mockedQueueService.sendResultToDigitalResultsQueue).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('SenderService::testTypeAllowedToSendToDigitalResult: unknown SARAS test type 25');
  });
});
