import { mocked } from 'ts-jest/utils';
import MockDate from 'mockdate';
import { AfterSendError } from '../../../../src/shared/errors/after-send-error';
import { CrmError } from '../../../../src/shared/errors/crm-error';
import { ValidationError } from '../../../../src/shared/errors/validation-error';
import { BusinessTelemetryEvent, logger } from '../../../../src/shared/utils/logger';
import { QueueRecordServiceBusMessage } from '../../../../src/v4/interfaces';
import QueueService from '../../../../src/v4/services/queue-service';
import { ResultProcessor } from '../../../../src/v4/services/result-processor';
import SenderService from '../../../../src/v4/services/sender-service';
import { serviceBusMessage } from '../../../mocks/result-records';

jest.mock('@azure/service-bus');
jest.mock('../../../../src/v4/services/sender-service');
jest.mock('../../../../src/v4/services/queue-service');

const mockedSenderService = mocked(SenderService, true);

describe('ResultProcessor', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('successfully processes result', async () => {
    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(SenderService.sendResult).toHaveBeenCalledWith(queueRecordSbMessage);
    expect(QueueService.completeResult).toHaveBeenCalledWith(queueRecordSbMessage);
    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvent.RES_CONSUMER_SUCCESSFULLY_SAVED,
      'ResultProcessor::processResult: Successfully saved result to CRM',
      expect.objectContaining({
        appointmentId: 'mockAppointmentId',
        candidateId: 'mockCandidateId',
        context_id: 'mockContextId',
        reference: 'mockReference',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        trace_id: 'testTraceId',
      }),
    );
  });

  test('dead letter result if message does not have a body', async () => {
    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;
    delete queueRecordSbMessage.body;

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(SenderService.sendResult).not.toHaveBeenCalled();
    expect(QueueService.deadLetterResult).toHaveBeenCalledWith(

      queueRecordSbMessage,
      { deadLetterErrorDescription: 'Received an empty message from arrival queue', deadLetterReason: 'Empty message' },
    );
  });

  test('dead letter result if message has a validation error', async () => {
    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;
    mockedSenderService.sendResult.mockImplementation(() => {
      throw new ValidationError('test validation error');
    });

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(QueueService.deadLetterResult).toHaveBeenCalledWith(
      queueRecordSbMessage,
      { deadLetterErrorDescription: 'test validation error', deadLetterReason: 'ValidationError' },
    );
  });

  test('abandon result if there is a crm error', async () => {
    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;
    mockedSenderService.sendResult.mockImplementation(() => {
      throw new CrmError('test crm error');
    });

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(QueueService.abandonResult).toHaveBeenCalledWith(
      queueRecordSbMessage,
    );
  });

  test('abandon result if an error occurs after sending to crm successfully', async () => {
    MockDate.set('2021-08-27T09:04:28');
    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;
    mockedSenderService.sendResult.mockImplementation(() => {
      throw new AfterSendError('test after send error');
    });

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(QueueService.abandonResult).toHaveBeenCalledWith(
      queueRecordSbMessage,
      { sentToCrmAt: '2021-08-27T08:04:28.000Z' },
    );
  });

  test('abandon result if there is an unknown error', async () => {
    MockDate.set('2021-08-27T09:04:28');

    const queueRecordSbMessage = serviceBusMessage() as QueueRecordServiceBusMessage;
    mockedSenderService.sendResult.mockImplementation(() => {
      throw new Error('test unknown error');
    });

    await ResultProcessor.processResult(queueRecordSbMessage);

    expect(QueueService.abandonResult).toHaveBeenCalledWith(
      queueRecordSbMessage,
    );
  });
});
