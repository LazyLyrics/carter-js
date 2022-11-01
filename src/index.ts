// import fetch from 'node-fetch'
import type { CarterPayload, CarterJSResponse, CarterQueryOptions, CarterConversationEntry } from './types';
import { v1 as uuidv1 } from 'uuid';
import { DateTime } from 'luxon';

export const Greeter = (name: string) => `Hello ${name}!`;

/**
 * Contains methods for interacting with Carter.
 */
export class Carter {
  apiKey: string;
  history: CarterConversationEntry[];
  latest: CarterConversationEntry | undefined;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.history = [];
  }

  /**
   * Say something to carter, takes a query parameter containing your message, as well as an options object (optional). Will create a uuid automatically if one is not provided.
   */
  async say(query: string, options?: CarterQueryOptions | undefined): Promise<CarterJSResponse> {
    const payload: CarterPayload = {
      api_key: this.apiKey,
      query,
    };
    if (options?.scene) {
      payload.scene = options.scene;
    }
    if (options?.uuid) {
      payload.uuid = options.uuid;
    } else {
      payload.uuid = uuidv1();
    }
    const response = await fetch('https://api.carterapi.com/v0/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    const returnObject: CarterJSResponse = {
      data: await response.json(),
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      payload,
    };
    const newInteraction = {
      isoString: DateTime.now().toISO(),
      request: payload,
      responseData: returnObject.data,
    };
    this.history.unshift(newInteraction);
    this.latest = newInteraction;
    return returnObject;
  }

  /**
   * Returns an audio link for any given text input using Carter's speak endpoint.
   */
  getVoiceLink(text: string): string {
    return `https://api.carterapi.com/v0/speak/${this.apiKey}/${text}`;
  }

  /**
   * Downvote a Carter response by passing in the CarterResponse object from Carter.say()
   */
  async downvote(carterResponse: CarterJSResponse): Promise<boolean> {
    const response = await fetch('https://api.carterapi.com/v0/downvote', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        tid: carterResponse.data.tid,
      }),
    });
    return response.ok;
  }
}
