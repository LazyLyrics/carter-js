// TEST LAST REPONSE WITH NO ENTRIES

// TEST AVERAGE WITH MINUTES PARAMETER WITH HISTORY

// TEST AVERAGE WITH MINUTES PARAMETER WITHOUT HISTORY

// TEST WITHOUT MINUTES AND NO HISTORY

// TEST WITHOUT MINUTES AND WITH HISTORY

import Carter from '../../index';
import dotenv from 'dotenv';
import * as types from '../../types';
dotenv.config();

jest.setTimeout(60000);

describe('response times', () => {
  let carter: Carter;
  beforeEach(async () => {
    carter = new Carter(process.env.CARTER_API_KEY as string);
    await new Promise((r) => setTimeout(r, 2000));
  });

  // TEST WITH INCORRECT MINUTES TYPE
  test('testing behaviour with incorrect minutes type', async () => {
    const shouldError = async () => {
      await carter.averageResponseTime('1' as any);
    };
    await expect(shouldError).rejects.toThrowError();
  });

  // TEST LAST AND AVERAGE REPONSE WITH ONE ENTRY

  test('testing behaviour with one entry', async () => {
    await carter.say("This is a test message, I'm testing your response times.", 'callum');
    expect(carter.history.length).toBe(1);
    expect(carter.lastResponseTime()).toBe(carter.history[0].timeTaken);
    expect(typeof carter.lastResponseTime()).toBe('number');

    expect(typeof carter.averageResponseTime()).toBe('number');

    expect(typeof carter.averageResponseTime(1)).toBe('number');
  });

  // TEST LAST AND AVERAGE REPONSE WITH NO ENTRIES
  test('testing behaviour with no entries', async () => {
    expect(carter.history.length).toBe(0);
    expect(carter.lastResponseTime()).toBe(undefined);
    expect(carter.averageResponseTime()).toBe(undefined);
    expect(carter.averageResponseTime(1)).toBe(undefined);
  });

  // TEST LAST AND AVERAGE WITH 5 ENTRIES
  // test('testing behaviour with 5 entries', async () => {
  //   // for (let i = 0; i < 5; i++) {
  //   //   const response = await carter.say("This is a test message, I'm testing your response times.", 'callum');
  //   // }
  //   expect(carter.history.length).toBe(5);
  //   expect(typeof carter.lastResponseTime()).toBe('number');
  //   expect(typeof carter.averageResponseTime()).toBe('number');
  //   expect(typeof carter.averageResponseTime(1)).toBe('number');
  // });
});
