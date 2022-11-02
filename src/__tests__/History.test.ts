import { Carter } from '../index'
import { isAConversationEntry } from '../types';

test('History Test', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    expect(carter.history.length).toBe(0)
    const response = await carter.say('Hello');
    expect(response.ok).toBe(true);
    expect(carter.history.length).toBe(1)
    expect(isAConversationEntry(carter.latest())).toBe(true)
  }
});
