import { Context } from '@azure/functions';

import ResultReceiverController from '../../../../../src/v4/resultsReceiver/controllers/result-receiver-controller';
import SARASResultBodySchema from '../../../../../src/v4/schemas/SARASResultBodyV4.schema.json';
import { ArrivalQueue } from '../../../../../src/v4/queues/arrival-queue';
import { resultRecordV3 } from '../../../../mocks/result-records';
import { mockedContext } from '../../../../mocks/context.mock';
import { mockedLogger } from '../../../../mocks/logger.mock';
import { BusinessTelemetryEvent, logger } from '../../../../../src/shared/utils/logger';

jest.mock('@azure/service-bus');
jest.mock('../../../../../src/v4/services/storage-service', () => ({
  persistImage: () => Promise.resolve('https://domain.local/image.png'),
}));
jest.mock('../../../../../src/v4/queues/arrival-queue');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mockUid'),
}));
jest.mock('../../../../../src/shared/utils/logger');

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

  test('Logs RES_RECEIVER_RECEIVED event', async () => {
    await resultController.receiveResult(httpContext as Context, SARASResultBodySchema);

    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvent.RES_RECEIVER_RECEIVED,
      'ResultReceiverController::receiveResult: Processing new result',
      {
        appointmentId: '10',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        testEndTime: '2020-07-24T10:20:02.754Z',
      },
    );
  });

  test('Adds result record on arrival queue', async () => {
    const response = await resultController.receiveResult(httpContext as Context, SARASResultBodySchema);

    expect(ArrivalQueue.prototype.sendMessage).toHaveBeenCalledWith(
      {
        ...resultRecordV3,
        trace_id: 'mockUid',
        context_id: '',
        reference: 'mockUid',
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
      reason: 'ResultReceiverController::receiveResult: AppointmentId is required as a URL param',
    });

    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvent.RES_RECEIVER_RECEIVED,
      'ResultReceiverController::receiveResult: Processing new result',
      {
        appointmentId: undefined,
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: 'PASS',
        testType: 'CAR',
        testEndTime: '2020-07-24T10:20:02.754Z',
      },
    );
  });

  test('Missing mandatory fields in request body is rejected', async () => {
    const mockCandidate = { ...resultRecordV3.Candidate };
    delete mockCandidate.CandidateID;
    const testInformation = { ...resultRecordV3.TestInformation };
    delete testInformation.OverallStatus;
    const context = {
      ...mockedContext,
      req: {
        params: {
          appointmentId: '10',
        },
        body: {
          ...resultRecordV3,
          Candidate: mockCandidate,
          TestInformation: testInformation,
        },
      },
    };

    await expect(resultController.receiveResult(context as unknown as Context, SARASResultBodySchema)).rejects.toStrictEqual({
      code: 400,
      reason: 'Validation Error - data.Candidate should have required property \'CandidateID\'',
    });

    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvent.RES_RECEIVER_RECEIVED,
      'ResultReceiverController::receiveResult: Processing new result',
      {
        appointmentId: '10',
        testCentreCode: 'mockTestCentreCode',
        testOverallStatus: undefined,
        testType: 'CAR',
        testEndTime: '2020-07-24T10:20:02.754Z',
      },
    );
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
      CandidatePhoto: '10-candidatephoto-mockUid.jpeg',
      CandidateSignature: '10-candidatesignature-mockUid.jpeg',
    };
    if (expected.AccommodationAssistant?.length) {
      expected.AccommodationAssistant[0].AssistantSignature = 'https://domain.local/image.png';
    }

    const response = await resultController.receiveResult(context as any as Context, SARASResultBodySchema);

    expect(response).toStrictEqual({
      code: 200,
      reason: 'Result received',
    });
    expect(ArrivalQueue.prototype.sendMessage).toHaveBeenCalledWith(
      {
        ...expected,
        trace_id: 'mockUid',
        context_id: '',
        reference: 'mockUid',
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

    const response = await resultController.receiveResult(context as any as Context, SARASResultBodySchema);

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
