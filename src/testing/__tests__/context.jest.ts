import Carter from '../../index';
import dotenv from 'dotenv';
import * as types from '../../types';
dotenv.config();

describe('context', () => {
  jest.setTimeout(60000);
  let carter: Carter;
  beforeEach(async () => {
    carter = new Carter(process.env.CARTER_API_KEY as string);
    await new Promise((r) => setTimeout(r, 2000));
  });
  // TEST WITH VALID INPUT
  test('test context with valid input', async () => {
    const response = await carter.context('Callum is testing Carter\'s context function.', 'callum');
    console.log('🚀 ~ file: context.jest.ts:17 ~ test ~ response:', response)
    expect(response.success).toBeTruthy();
  });
  // TEST WITH INVALID INPUT
  test('test context with invalid input', async () => {
    await expect(carter.context(4 as any, 4 as any)).rejects.toThrowError();
  });
  // TEST WITH NO PLAYER ID
  test('test context with no player id', async () => {
    const response = await carter.context('Callum is testing Carter\'s context function.');
    expect(response.success).toBeTruthy();
  });

});
