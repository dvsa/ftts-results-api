import DynamicsWebApi from 'dynamics-web-api';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { newDynamicsWebApi } from '../../src/v3/crm/auth/dynamics-web-api';

jest.mock('../../src/v3/crm/auth/dynamics-web-api');

const mockedNewDynamicsWebApi = mocked(newDynamicsWebApi);

mockedNewDynamicsWebApi.mockImplementation(
  (): DynamicsWebApi => mockedDynamicsWebApi,
);

export const mockedDynamicsWebApi = mock<DynamicsWebApi>();
