import { Context, Logger } from '@azure/functions';
import { logger } from '../../src/shared/utils/logger';

export const mockedContext: Context = {
  invocationId: '',
  executionContext: {
    invocationId: '',
    functionName: '',
    functionDirectory: '',
  },
  bindings: {},
  bindingData: {},
  traceContext: {
    traceparent: 'parent-value',
    tracestate: 'state-value',
    attributes: {},
  },
  bindingDefinitions: [],
  log: logger as unknown as Logger,
  done: (err?: Error | string | null): void => console.log(err),
};
