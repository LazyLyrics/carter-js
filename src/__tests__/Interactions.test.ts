import { Greeter, Carter } from '../index';
import * as dotenv from 'dotenv';
dotenv.config();

jest.setTimeout(10000);

test('Greeter Test', () => {
  expect(Greeter('LazyLyrics')).toBe('Hello LazyLyrics!');
});

test('Say Test 1', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    let response = await carter.say('Hello');
    expect(response.ok).toBe(true);
  } else {
    throw Error('No API key found.');
  }
});

test('Say Test 2', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    let response = await carter.say('Hello', { uuid: 'hasfasf', scene: 'level-one' });
    expect(response.ok).toBe(true);
  } else {
    throw Error('No API key found.');
  }
});

test('Say Test 3', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    let response = await carter.say('Hello', { scene: 'level-one' });
    expect(response.ok).toBe(true);
  } else {
    throw Error('No API key found.');
  }
});

test('Downvote Test', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    const response = await carter.say('Hello');
    expect(response.ok).toBe(true);
    const downvoted = await carter.downvote(response);
    expect(downvoted).toBe(true);
  }
});

test('Speak Test', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    const audioLink = carter.getVoiceLink('Hello, listen to me speak!');
    expect(audioLink).toBe(
      `https://api.carterapi.com/v0/speak/${process.env.CARTER_API_KEY}/Hello, listen to me speak!`,
    );
  }
});
