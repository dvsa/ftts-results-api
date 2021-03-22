import { mocked } from 'ts-jest/utils';
import { mockedContext } from '../../../../mocks/context.mock';
import ResultSenderController from '../../../../../src/v3/resultSender/controllers/result-sender-controller';
import { QueueMessage } from '../../../../../src/v3/interfaces';
import { queueRecord } from '../../../../mocks/result-records';
import ArrivalQueue from '../../../../../src/v3/queues/arrival-queue';
import { logger } from '../../../../../src/shared/utils/logger';
import CrmService from '../../../../../src/v3/services/crm-service';
import QueueService from '../../../../../src/v3/services/queue-service';
import { CrmError } from '../../../../../src/v3/crm/crm-error';
import { PaymentEventError } from '../../../../../src/v3/interfaces/payment-event';

jest.mock('../../../../../src/v3/services/crm-service');
jest.mock('../../../../../src/v3/services/queue-service');
jest.mock('../../../../../src/v3/queues/arrival-queue');
jest.mock('../../../../../src/v3/queues/payment-events-queue');

const mockedCrmService = mocked(CrmService, true);
const mockedQueueService = mocked(QueueService, true);

describe('Result Sender Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Successfully sends to CRM', async () => {
    const record = queueRecord();
    const queueMessage: QueueMessage = { body: record };

    await ResultSenderController.processResultsQueueMessage(mockedContext, queueMessage);

    expect(CrmService.sendResultToCrm).toBeCalledWith(mockedContext, record);
  });

  test('Validation errors log critical and throws error to send to DLQ', async () => {
    const record = queueRecord();
    delete record.Candidate;
    const queueMessage: QueueMessage = { body: record };

    await expect(() => ResultSenderController.processResultsQueueMessage(mockedContext, queueMessage))
      .rejects.toThrow();
    expect(logger.critical).toBeCalled();
  });

  test('Retry if there are CRM errors', async () => {
    const queueMessage: QueueMessage = { body: queueRecord() };
    mockedCrmService.sendResultToCrm.mockImplementationOnce(() => {
      throw new CrmError('Unknown crm error');
    });

    await ResultSenderController.processResultsQueueMessage(mockedContext, queueMessage);

    expect(ArrivalQueue.prototype.handleSendFailureRetry).toHaveBeenCalled();
  });

  test('Should not retry if there are CRM 404 errors', async () => {
    const queueMessage: QueueMessage = { body: queueRecord() };
    mockedCrmService.sendResultToCrm.mockImplementationOnce(() => {
      throw new CrmError({
        message: 'Not found',
        status: 404,
        name: 'error',
      });
    });

    await expect(ResultSenderController.processResultsQueueMessage(mockedContext, queueMessage)).rejects.toThrow();
    expect(ArrivalQueue.prototype.handleSendFailureRetry).not.toHaveBeenCalled();
  });

  test('Retry if there are Payment errors', async () => {
    const queueMessage: QueueMessage = { body: queueRecord() };
    mockedQueueService.sendResultStatusToPaymentsQueue.mockImplementationOnce(() => {
      throw new PaymentEventError('Unknown queue error');
    });
    await ResultSenderController.processResultsQueueMessage(mockedContext, queueMessage);

    expect(ArrivalQueue.prototype.handleSendFailureRetry).toHaveBeenCalled();
  });
});
