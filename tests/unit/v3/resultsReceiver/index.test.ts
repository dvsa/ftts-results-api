import { HttpRequest } from '@azure/functions';
import { httpTriggerContextWrapper } from '@dvsa/azure-logger';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { httpTrigger, index } from '../../../../src/v3/resultsReceiver';
import ResultReceiverController from '../../../../src/v4/resultsReceiver/controllers/result-receiver-controller';
import { mockedContext } from '../../../mocks/context.mock';

jest.mock('@azure/service-bus');
jest.mock('../../../../src/v4/resultsReceiver/controllers/result-receiver-controller');
const resultController = mocked(ResultReceiverController, true);

const mockedHttpTrigger = mocked(httpTriggerContextWrapper);
const httpRequestMock = mock<HttpRequest>();

describe('Results Receiver', () => {
  test('runs wrapper', async () => {
    await index(mockedContext, httpRequestMock);

    expect(mockedHttpTrigger).toHaveBeenCalledWith(expect.any(Function), mockedContext, httpRequestMock);
  });

  test('Runs result controller', async () => {
    await httpTrigger(mockedContext);

    expect(resultController.prototype.receiveResult).toHaveBeenCalled();
  });
});
