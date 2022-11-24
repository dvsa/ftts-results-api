import { mocked } from 'ts-jest/utils';
import { mock } from 'jest-mock-extended';
import { nonHttpTriggerContextWrapper } from '@dvsa/azure-logger';
import { mockedContext } from '../../../mocks/context.mock';
import { index, resultSenderTrigger } from '../../../../src/v4/resultSender';
import { SARASResultQueueRecord } from '../../../../src/v4/interfaces';
import { processMessages } from '../../../../src/v4/resultSender/controllers/result-sender-timer-controller';

jest.mock('@azure/service-bus');
jest.mock('../../../../src/v4/resultSender/controllers/result-sender-timer-controller');
const mockedProcessMessages = mocked(processMessages, true);

const mockedNonHttpTrigger = mocked(nonHttpTriggerContextWrapper);
const queueRecordMock = mock<SARASResultQueueRecord>();

describe('resultsSenderTimerTrigger', () => {
  test('runs wrapper', async () => {
    await index(mockedContext, queueRecordMock);

    expect(mockedNonHttpTrigger).toHaveBeenCalledWith(expect.any(Function), mockedContext, queueRecordMock);
  });

  test('Runs controller', async () => {
    await resultSenderTrigger(mockedContext, {});

    expect(mockedProcessMessages).toHaveBeenCalled();
  });
});
