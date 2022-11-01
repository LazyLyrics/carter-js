import { Greeter, Carter } from '../index';
import * as dotenv from 'dotenv';
dotenv.config();

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
    let response = await carter.say('Hello', 'hasfasf', 'level-one');
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
    let response = await carter.say('Hello', undefined, 'level-one');
    expect(response.ok).toBe(true);
  } else {
    throw Error('No API key found.');
  }
});
