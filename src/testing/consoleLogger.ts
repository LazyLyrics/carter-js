import type { Logger } from '../types';
export class consoleLogger implements Logger {
  debug = console.debug;
  info = console.info;
  warn = console.warn;
  error = console.error;
}
