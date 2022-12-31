import {
  CarterPayload,
  CarterInteraction,
  CarterPayloadOptions,
  CarterConversationEntry,
  isACarterInteraction,
  isAConversationEntry,
  CarterSkill,
  CarterSkillOptions,
  CarterSkillAction,
  CarterSkillInstance,
} from './types';
import { v1 as uuidv1 } from 'uuid';
import { DateTime } from 'luxon';

/**
 * Contains methods for interacting with Carter.
 */
export class Carter {
  apiKey: string;
  history: CarterConversationEntry[] = [];
  skills: CarterSkill[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // INTERACTION
  // ========================

  /**
   * Say something to carter, takes a query parameter containing your message, as well as an options object (optional). Will create a uuid automatically if one is not provided.
   */
  async say(query: string, options?: CarterPayloadOptions | undefined): Promise<CarterInteraction> {
    const triggeredSkills: CarterSkillInstance[] = [];
    const executedSkills: CarterSkillInstance[] = [];
    let data;
    let interaction: CarterInteraction;

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

    if (response.ok) {
      data = await response.json();
    } else {
      return {
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        payload,
        triggeredSkills: [],
        executedSkills: [],
      };
    }

    if (data.triggers) {
      for (const trigger of data.triggers) {
        const skill = this.findSkill(trigger.type);
        let newOutput;
        if (skill) {
          const skillInstance = new CarterSkillInstance(skill, data.output.text, trigger.metadata, trigger.entities);
          if (skill.options.auto) {
            newOutput = await skillInstance.execute();
            data.output.text = newOutput;
            data.output.voice = this.getVoiceLink(newOutput);
            executedSkills.push(skillInstance);
          } else {
            triggeredSkills.push(skillInstance);
          }
        }
      }
    }

    interaction = {
      data,
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      payload,
      triggeredSkills,
      executedSkills,
    };
    const newConversationEntry: CarterConversationEntry = {
      isoTimestamp: DateTime.now().toISO(),
      interaction,
    };
    this.history.unshift(newConversationEntry);
    return interaction;
  }

  // VOICE
  // ======================

  /**
   * Returns an audio link for any given text input using Carter's speak endpoint.
   */
  getVoiceLink(text: string): string {
    return `https://api.carterapi.com/v0/speak/${this.apiKey}/${text}`;
  }

  // SKILLS
  // =====================

  registerSkill(name: string, action: CarterSkillAction, options?: CarterSkillOptions): CarterSkill | undefined {
    const existing = this.findSkill(name);
    if (existing) {
      return undefined;
    } else {
      const skill: CarterSkill = { name, action, options: options ? options : {} };
      this.skills.push(skill);
      return skill;
    }
  }

  findSkill(name: string): CarterSkill | undefined {
    const skill = this.skills.find((value) => value.name === name);
    return skill;
  }

  // DOWNVOTING
  // ======================

  /**
   * Downvote a Carter response by passing in the CarterResponse object from Carter.say()
   */
  async downvote(target: CarterInteraction | (CarterConversationEntry | undefined) | string): Promise<boolean> {
    let body:
      | {
          api_key: string;
          tid: string;
        }
      | {} = {};
    if (typeof target === 'string') {
      body = {
        api_key: this.apiKey,
        tid: target,
      };
    } else if (isACarterInteraction(target)) {
      if (target.data) {
        body = {
          api_key: this.apiKey,
          tid: target.data.tid,
        };
      } else {
        return false;
      }
    } else if (isAConversationEntry(target)) {
      if (target.interaction.data) {
        body = {
          api_key: this.apiKey,
          tid: target.interaction.data.tid,
        };
      } else {
        return false;
      }
    } else {
      throw Error(
        'Did not receive correct target, please ensure you passed a TID, an interaction, or a conversation entry.',
      );
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

  // HISTORY
  // =================

  /**
   * Returns the latest interaction in the conversation history.
   */
  latest(): CarterConversationEntry | undefined {
    if (this.history.length > 0) {
      return this.history[0];
    } else {
      return undefined;
    }
  }

  /** Returns the response time of your last interaction with Carter */
  lastResponseTime(): number | undefined {
    return this.latest()?.interaction.data?.time_taken;
  }

  /**
   * Returns the average response time for a given number of minutes if given. If not given, the average response time for your the entire history is returned. If there is either no history or no interactions in the given time period, the return value will be undefined.
   */
  averageResponseTime(minutes?: number): number | undefined {
    const times: number[] = [];
    if (minutes) {
      const lowerBound = DateTime.now().minus({ minutes });
      for (const entry of this.history) {
        const dt = DateTime.fromISO(entry.isoTimestamp);
        if (dt > lowerBound && entry.interaction.data?.time_taken) {
          times.push(entry.interaction.data.time_taken);
        }
      }
      if (times.length > 0) {
        const total = times.reduce((a, b) => a + b);
        const average = total / times.length;
        return average;
      } else {
        return undefined;
      }
    } else {
      for (const entry of this.history) {
        const dt = DateTime.fromISO(entry.isoTimestamp);
        if (entry.interaction.data?.time_taken) {
          times.push(entry.interaction.data.time_taken);
        }
      }
      if (times.length > 0) {
        const total = times.reduce((a, b) => a + b);
        const average = total / times.length;
        return average;
      } else {
        return undefined;
      }
    }
  }
}
