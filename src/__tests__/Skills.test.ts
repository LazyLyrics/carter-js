import { Carter } from '../index';
import * as dotenv from 'dotenv';
dotenv.config();

jest.setTimeout(10000);

test('Skills test', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    let response = await carter.say('Hello');
    expect(response.ok).toBe(true);

    carter.registerSkill(
      'News request',
      () => {
        return {
          output: 'NEWS',
        };
      },
      { auto: true },
    );

    carter.registerSkill(
      'Weather Request', () => {

      }
    )

    response = await carter.say('Give me the news');
    expect(response.data?.output.text).toBe('NEWS');

    response = await carter.say("What's the weather like?")
    expect(response.data?.output.text).toBe('The weather is currently, $replace-with-weather')
  } else {
    throw Error('No API key found.');
  }
});
