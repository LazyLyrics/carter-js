import { consoleLogger } from '../consoleLogger';
import Carter from '../../index';
import dotenv from 'dotenv';
dotenv.config();
// TEST ALL NO OP LOGGER FUNCTIONS

// TEST VALIDATELOGGER

describe('logging', () => {
  test('passing a logger throws no errors', () => {
    expect(() => {
      const carter = new Carter(process.env.CARTER_API_KEY as string, new consoleLogger());
    }).not.toThrowError();
  });
});
