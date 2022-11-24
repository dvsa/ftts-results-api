import { mocked } from 'ts-jest/utils';
import config from '../../src/shared/config';

jest.mock('../../src/shared/config');

export const mockedConfig = mocked(config, true);
