import { Carter } from '../index';

test('Downvote Test w Interaction Object', async () => {
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
test('Downvote Test w latest ConversationEntry Object', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    const response = await carter.say('Hello');
    expect(response.ok).toBe(true);
    const downvoted = await carter.downvote(carter.latest());
    expect(downvoted).toBe(true);
  }
});
test('Downvote Test w tid Object', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  let carter: Carter;
  if (apiKey) {
    carter = new Carter(apiKey);
    const response = await carter.say('Hello');
    expect(response.ok).toBe(true);
    const downvoted = await carter.downvote(response.data?.tid);
    expect(downvoted).toBe(true);
  }
});
