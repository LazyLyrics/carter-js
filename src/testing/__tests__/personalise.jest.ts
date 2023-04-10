import Carter from '../../index';
import dotenv from 'dotenv';
import * as types from '../../types';
dotenv.config();

describe('personalise', () => {
  jest.setTimeout(60000);
  let carter: Carter;
  beforeEach(() => {
    carter = new Carter(process.env.CARTER_API_KEY as string);
  });
  // TEST WITH VALID INPUT
  test('test personalise with valid input', async () => {
    const response = await carter.personalise('This is a sentence which the api is going to personalise');
    expect(types.isCarterPersonaliseInteraction(response)).toBeTruthy();
  });
  // TEST WITH INVALID INPUT
  test('test opener with invalid input', async () => {
    await expect(carter.personalise(4 as any)).rejects.toThrowError();
  });
  // TEST WITH VALID INPUT WITH BAD API RESPONSE - nock - still to add
});
