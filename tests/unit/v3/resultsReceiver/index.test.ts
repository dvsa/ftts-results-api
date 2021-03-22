import { mocked } from 'ts-jest/utils';
import { mockedContext } from '../../../mocks/context.mock';
import httpTrigger from '../../../../src/v3/resultsReceiver';
import ResultReceiverController from '../../../../src/v3/resultsReceiver/controllers/result-receiver-controller';

jest.mock('../../../../src/v3/resultsReceiver/controllers/result-receiver-controller');
const resultController = mocked(ResultReceiverController, true);

describe('Results Receiver', () => {
  test('Runs result controller', async () => {
    await httpTrigger(mockedContext);

    expect(resultController.prototype.receiveResult).toHaveBeenCalled();
  });
});
