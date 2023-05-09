import * as types from './types';

const noop = () => {
  return;
};

export class NoOpLogger implements types.Logger {
  debug = noop;
  info = noop;
  warn = noop;
  error = noop;
}

export function validateLogger(logger: any): logger is types.Logger {
  return (
    typeof logger === 'object' &&
    typeof logger.debug === 'function' &&
    typeof logger.info === 'function' &&
    typeof logger.warn === 'function' &&
    typeof logger.error === 'function'
  );
}

export class consoleLogger implements types.Logger {
  debug = console.debug;
  info = console.info;
  warn = console.warn;
  error = console.error;
}
