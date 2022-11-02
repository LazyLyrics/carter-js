// import fetch from 'node-fetch'
import { CarterPayload, CarterInteraction, CarterPayloadOptions, CarterConversationEntry, isACarterInteraction, isAConversationEntry } from './types';
import { v1 as uuidv1 } from 'uuid';
import { DateTime } from 'luxon';

export const Greeter = (name: string) => `Hello ${name}!`;

/**
 * Contains methods for interacting with Carter.
 */
export class Carter {
  apiKey: string;
  history: CarterConversationEntry[];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.history = [];
  }

  latest(): CarterConversationEntry | undefined {
    if (this.history.length > 0) {
      return this.history[0]
    } else {
      return undefined
    }
  }

  /**
   * Say something to carter, takes a query parameter containing your message, as well as an options object (optional). Will create a uuid automatically if one is not provided.
   */
  async say(query: string, options?: CarterPayloadOptions | undefined): Promise<CarterInteraction> {
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
    const interaction: CarterInteraction = {
      data: await response.json(),
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      payload,
    };
    const newConversationEntry: CarterConversationEntry = {
      isoTimestamp: DateTime.now().toISO(),
      interaction
    };
    this.history.unshift(newConversationEntry);
    return interaction;
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
  async downvote(target: CarterInteraction | (CarterConversationEntry | undefined) | string): Promise<boolean> {
    let body: {
      api_key: string,
      tid: string
    } | {} = {};
    if (typeof target === "string") {
      body = {
        api_key: this.apiKey,
        tid: target
      }
    }
    else if (isACarterInteraction(target)) {
      body = {
        api_key: this.apiKey,
        tid: target.data.tid,
      }
    } else if (isAConversationEntry(target)) {
      body = {
        api_key: this.apiKey,
        tid: target.interaction.data.tid,
      }
    }
    else {
      throw Error("Did not receive correct target, please ensure you passed the right type.")
    }
    const response = await fetch('https://api.carterapi.com/v0/downvote', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.ok;
  }
}
