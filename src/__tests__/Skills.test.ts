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

    carter.registerSkill("News request", () => {
      return {
        output: "NEWS"
      }
    }, { auto: true })

    response = await carter.say("Give me the news")
    expect(response.data?.output.text).toBe("NEWS")

  } else {
    throw Error('No API key found.');
  }
});
