import Carter from '../../index';
import * as helpers from '../helpers';
import dotenv from 'dotenv';
dotenv.config();

jest.setTimeout(60000);

describe('say', () => {
  let carter: Carter;

  beforeEach(() => {
    const API_KEY = process.env.CARTER_API_KEY as string;
    carter = new Carter(API_KEY);
    console.log(API_KEY);
    console.log(carter.apiKey);
  });

  // BOTH VALID INPUTS
  test('should return an interaction with carter data', async () => {
    const response = await carter.say('Hello, this is a test message.', 'callum');
    console.log(response.statusCode);
    helpers.expectSuccessfulCarterInteraction(response);
  });

  // REPEATED INPUTS

  // test('should return multiple interactions with carter data', async () => {
  //   let response = await carter.say("Hello, this is a test message. I'm going to be sending a few of these.", 'callum');
  //   for (let i = 0; i < 5; i++) {
  //     response = await carter.say('This is another test message.', 'callum');
  //     helpers.expectSuccessfulCarterInteraction(response);
  //   }
  // });

  // TEST WITH INVALID INPUTS
  test('should throw an error with invalid text', async () => {
    await expect(carter.say(1 as any, 'callum')).rejects.toThrowError();
  });

  test('should throw an error with invalid playerId', async () => {
    await expect(carter.say('Hello', 1 as any)).rejects.toThrowError();
  });

  test('should throw an error with all invalid data', async () => {
    await expect(carter.say(1 as any, 1 as any)).rejects.toThrowError();
  });
});
