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
    const response = await carter.personalise('This is a sentence which the api is going to personalise', 'test');
    expect(types.isCarterInteraction(response)).toBeTruthy();
  });
  // TEST WITH INVALID INPUT
  test('test opener with invalid input', async () => {
    await expect(carter.personalise(4 as any, 'test')).rejects.toThrowError();
  });
  // TEST WITH ALL SPEAK VALUES
  test('test personalise with speak = true', async () => {
    const response = await carter.personalise('This is a sentence which the api is going to personalise', 'test', true);
    expect(types.isCarterInteraction(response)).toBeTruthy();
  });

  test('test personalise with speak = false', async () => {
    const response = await carter.personalise(
      'This is a sentence which the api is going to personalise',
      'test',
      false,
    );
    expect(types.isCarterInteraction(response)).toBeTruthy();
  });

  test('test personalise with speak = undefined', async () => {
    const response = await carter.personalise(
      'This is a sentence which the api is going to personalise',
      'test',
      undefined,
    );
    expect(types.isCarterInteraction(response)).toBeTruthy();
  });

  test('test personalise with speak = number', async () => {
    const shouldError = async () => {
      await carter.personalise('This is a sentence which the api is going to personalise', 'test', 2 as any);
    };
    await expect(shouldError).rejects.toThrowError();
  });
});
