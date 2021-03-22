import { Context } from '@azure/functions';

import ResultReceiverController from '../../../../../src/v3/resultsReceiver/controllers/result-receiver-controller';
import SARASResultBodySchema from '../../../../../src/v3/schemas/SARASResultBodyV3.schema.json';
import ArrivalQueue from '../../../../../src/v3/queues/arrival-queue';
import { resultRecordV3 } from '../../../../mocks/result-records';
import { mockedContext } from '../../../../mocks/context.mock';
import { mockedLogger } from '../../../../mocks/logger.mock';

jest.mock('../../../../../src/v3/services/storage-service', () => ({
  persistImage: () => Promise.resolve('https://domain.local/image.png'),
}));
jest.mock('../../../../../src/v3/queues/arrival-queue');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'testOpId'),
}));

describe('Result Controller', () => {
  let resultController: ResultReceiverController;
  let httpContext: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');

    resultController = new ResultReceiverController();
    httpContext = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...resultRecordV3,
        },
      },
    };
  });

  test('Adds result record on arrival queue', async () => {
    const response = await resultController.receiveResult(httpContext, SARASResultBodySchema);

    expect(ArrivalQueue.prototype.send).toHaveBeenCalledWith(
      httpContext,
      {
        ...resultRecordV3,
        trace_id: 'testOpId',
        context_id: 'parent-value',
        reference: 'testOpId',
        noOfArrivalQueueRetries: 0,
        AppointmentId: '10',
      },
    );
    expect(response).toStrictEqual({
      code: 200,
      reason: 'Result received',
    });
  });

  test('Missing appointmentId is rejected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const context: Partial<Context> = { ...httpContext };
    delete context.req.params.appointmentId;

    await expect(resultController.receiveResult(context as Context, SARASResultBodySchema)).rejects.toEqual({
      code: 400,
      reason: 'AppointmentId is required as a URL param',
    });
  });

  test('Missing mandatory fields in request body is rejected', async () => {
    const mockCandidate = { ...resultRecordV3.Candidate };
    delete mockCandidate.CandidateID;
    const context = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...resultRecordV3,
          Candidate: mockCandidate,
        },
      },
    };

    await expect(resultController.receiveResult(context as unknown as Context, SARASResultBodySchema)).rejects.toStrictEqual({
      code: 400,
      reason: 'Validation Error - data.Candidate should have required property \'CandidateID\'',
    });
  });

  test('Missing non-mandatory fields in request body is accepted', async () => {
    const mockCandidate = { ...resultRecordV3.Candidate };
    delete mockCandidate.Address;
    const context = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...resultRecordV3,
          Candidate: mockCandidate,
        },
      },
    };

    const response = await resultController.receiveResult(context as unknown as Context, SARASResultBodySchema);

    expect(response).toStrictEqual({
      code: 200,
      reason: 'Result received',
    });
  });

  test('Transforms images into file references', async () => {
    const context = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...resultRecordV3,
        },
      },
    };
    const expected = { ...resultRecordV3 };
    expected.Admission = {
      ...expected.Admission,
      CandidatePhoto: 'https://domain.local/image.png',
      CandidateSignature: 'https://domain.local/image.png',
    };
    if (expected.AccommodationAssistant?.length) {
      expected.AccommodationAssistant[0].AssistantSignature = 'https://domain.local/image.png';
    }

    const response = await resultController.receiveResult(context as any, SARASResultBodySchema);

    expect(response).toStrictEqual({
      code: 200,
      reason: 'Result received',
    });
    expect(ArrivalQueue.prototype.send).toHaveBeenCalledWith(
      httpContext,
      {
        ...expected,
        trace_id: 'testOpId',
        context_id: 'parent-value',
        reference: 'testOpId',
        noOfArrivalQueueRetries: 0,
        AppointmentId: '10',
      },
    );
  });

  test('Handles payload with no images', async () => {
    const mockCandidate = { ...resultRecordV3 };
    delete mockCandidate.Admission?.CandidateSignature;
    delete mockCandidate.Admission?.CandidatePhoto;
    delete mockCandidate.AccommodationAssistant;
    const context = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...mockCandidate,
        },
      },
    };

    const response = await resultController.receiveResult(context as any, SARASResultBodySchema);

    expect(response).toStrictEqual({
      code: 200,
      reason: 'Result received',
    });
  });

  test('Unknown Error returns internal server error', async () => {
    const context: Partial<Context> = { ...mockedContext };
    delete context.req;

    await expect(resultController.receiveResult(context as Context, SARASResultBodySchema)).rejects.toStrictEqual({
      code: 500,
      reason: 'Internal server error',
    });
  });
});
