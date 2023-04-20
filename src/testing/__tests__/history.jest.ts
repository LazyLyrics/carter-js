import * as types from '../../types';
import Carter from '../../index';
import dotenv from 'dotenv';
dotenv.config();

describe('history', () => {
  jest.setTimeout(60000);

  let carter: Carter;

  beforeEach(() => {
    const API_KEY = process.env.CARTER_API_KEY as string;
    carter = new Carter(API_KEY);
  });

  // TEST HISTORY WITH ONE ENTRY
  test('test history with at least one entry', async () => {
    expect(carter.history.length).toBe(0);
    expect(carter.latest()).toBeUndefined();

    const response = await carter.say('hello, this is a test message', 'callum');
    expect(types.isCarterInteraction(response)).toBeTruthy();

    expect(carter.history.length).toBe(1);
    expect(carter.latest()).toBeDefined();
    expect(types.isCarterConversationEntry(carter.latest())).toBeTruthy();
  });

  // TEST HISTORY WITH NO ENTRIES
  test('test latest with no entries', () => {
    expect(carter.history.length).toBe(0);
    expect(carter.latest()).toBeUndefined();
  });

  // TEST HISTORY WITH 5 ENTRIES
  // test('test history with 5 entries', async () => {
  //   expect(carter.history.length).toBe(0);
  //   expect(carter.latest()).toBeUndefined();
  //   for (let i = 0; i < 5; i++) {
  //     await carter.say('hello, this is a test message', 'callum');
  //   }
  //   expect(carter.history.length).toBe(5);

  //   for (const interaction of carter.history) {
  //     expect(types.isCarterConversationEntry(interaction)).toBeTruthy();
  //   }

  //   expect(carter.latest()).toBeDefined();
  //   expect(types.isCarterConversationEntry(carter.latest())).toBeTruthy();
  // });
});
