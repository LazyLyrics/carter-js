// import fetch from 'node-fetch'
import type { CarterPayload, CarterResponse } from './types';
import { v1 as uuidv1 } from 'uuid';

export const Greeter = (name: string) => `Hello ${name}!`;

export class Carter {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async say(query: string, uuid?: string, scene?: string): Promise<CarterResponse> {
    const payload: CarterPayload = {
      api_key: this.apiKey,
      query: query,
    };
    if (scene) {
      payload.scene = scene;
    }
    if (uuid) {
      payload.uuid = uuid;
    } else {
      payload.uuid = uuidv1();
    }
    const response = await fetch('https://api.carterapi.com/v0/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      data: await response.json(),
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      payload: payload,
    };
  }
}
