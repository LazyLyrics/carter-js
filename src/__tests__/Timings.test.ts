import { Carter } from '../index';

test('Last Response Time Test', async () => {
  const apiKey = process.env.CARTER_API_KEY;
  if (apiKey) {
    const carter = new Carter(apiKey);
    expect(carter.lastResponseTime()).toBeUndefined();
    expect(carter.averageResponseTime()).toBeUndefined();
    expect(carter.averageResponseTime(5)).toBeUndefined();
    const interaction = await carter.say('Hello Carter!');
    expect(interaction.ok).toBe(true);
    // Check last response time
    expect(carter.lastResponseTime()).toBeDefined();
    expect(carter.lastResponseTime()).toBeInstanceOf(Number);
    // Check average of all
    expect(carter.averageResponseTime()).toBeDefined();
    expect(carter.averageResponseTime()).toBeInstanceOf(Number);
    // Check average of last 5 minutes
    expect(carter.averageResponseTime(5)).toBeDefined();
    expect(carter.averageResponseTime(5)).toBeInstanceOf(Number);
  }
});
