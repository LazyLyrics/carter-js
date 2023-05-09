import Carter from '../../index';
import dotenv from 'dotenv';
import * as types from '../../types';
dotenv.config();

describe('opener', () => {
  jest.setTimeout(60000);
  let carter: Carter;
  beforeEach(() => {
    carter = new Carter(process.env.CARTER_API_KEY as string);
  });
  // TEST WITH VALID INPUT
  test('test opener with valid input', async () => {
    const interaction = await carter.opener('callum');
    expect(types.isCarterInteraction(interaction)).toBeTruthy();
  });
  // TEST WITH INVALID INPUT
  test('test opener with invalid input', async () => {
    await expect(carter.opener(4 as any)).rejects.toThrowError();
  });
  // TEST WITH NO PLAYER ID
  test('test opener with no player id', async () => {
    const interaction = await carter.opener();
    expect(types.isCarterInteraction(interaction)).toBeTruthy();
  });
});
