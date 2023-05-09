import Carter from '../../index';
import dotenv from 'dotenv';
import * as types from '../../types';
dotenv.config();

describe('constructor tests', () => {
  jest.setTimeout(60000);
  let carter: Carter;
  // TEST WITH VALID INPUT
  test('test carter with valid options', async () => {
    expect(() => {
      const carter = new Carter(process.env.CARTER_API_KEY as string);
    }).not.toThrowError();
  });
  // TEST WITH INVALID INPUT
  test('test carter with invalid apiKey', async () => {
    expect(() => {
      const carter = new Carter(4 as any);
    }).toThrowError();
  });
  // TEST WITH ALL POSSIBLE SPEAK VALUES
  test('test carter with speak = true', async () => {
    const carter = new Carter(process.env.CARTER_API_KEY as string, undefined, true);
    expect(carter.speakDefault).toBe(true);
  });

  test('test carter with speak = false', async () => {
    const carter = new Carter(process.env.CARTER_API_KEY as string, undefined, false);
    expect(carter.speakDefault).toBe(false);
  });

  test('test carter with speak = undefined', async () => {
    const carter = new Carter(process.env.CARTER_API_KEY as string, undefined, undefined);
    expect(carter.speakDefault).toBe(false);
  });

  test('test carter with speak = number', async () => {
    const carter = new Carter(process.env.CARTER_API_KEY as string, undefined, 2 as any);
    expect(carter.speakDefault).toBe(false);
  });
});
