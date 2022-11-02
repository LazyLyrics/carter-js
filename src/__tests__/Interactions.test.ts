import { Greeter, Carter } from '../index';
import * as dotenv from 'dotenv';
dotenv.config();

jest.setTimeout(10000);

test('Greeter Test', () => {
  expect(Greeter('LazyLyrics')).toBe('Hello LazyLyrics!');
});

test('Say() test without options', async () => {
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

test('Say() test with uuid and scene', async () => {
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

test('Say() test with scene only', async () => {
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
