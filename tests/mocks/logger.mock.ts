import { mocked } from 'ts-jest/utils';
import { logger } from '../../src/shared/utils/logger';

jest.mock('../../src/shared/utils/logger');

export const mockedLogger = mocked(logger, true);
