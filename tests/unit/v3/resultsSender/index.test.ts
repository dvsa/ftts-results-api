import { mocked } from 'ts-jest/utils';
import { mockedContext } from '../../../mocks/context.mock';
import resultSenderTrigger from '../../../../src/v3/resultSender';
import ResultSenderController from '../../../../src/v3/resultSender/controllers/result-sender-controller';

jest.mock('../../../../src/v3/resultSender/controllers/result-sender-controller');
const resultSenderController = mocked(ResultSenderController, true);

describe('resultsSenderTrigger', () => {
  test('Runs controller', async () => {
    await resultSenderTrigger(mockedContext, {});

    expect(resultSenderController.processResultsQueueMessage).toHaveBeenCalled();
  });
});
