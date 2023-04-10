import {
  CarterPayload,
  CarterInteraction,
  CarterConversationEntry,
  CarterSkill,
  CarterSkillOptions,
  CarterSkillAction,
  CarterSkillInstance,
  CarterData,
  CarterOpenerData,
  CarterOpenerInteraction,
  CarterPersonaliseInteraction,
  Logger,
  isCarterSkillAction,
  isCarterSkillOptions,
} from './types';
import { v1 as uuidv1 } from 'uuid';
import { DateTime } from 'luxon';
import now from 'performance-now';
import * as logging from './logger';

export const URLS = {
  say: 'https://api.carterlabs.ai/chat',
  personalise: 'https://api.carterlabs.ai/personalise',
  opener: 'https://api.carterlabs.ai/opener',
};

/**
 * Contains methods for interacting with Carter.
 */
export default class Carter {
  apiKey: string;
  history: CarterConversationEntry[] = [];
  skills: CarterSkill[] = [];
  logger: Logger = new logging.NoOpLogger();

  constructor(apiKey: string, userLogger?: Logger) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw Error(`Carter constructor requires a string as the first parameter. Received: ${apiKey}.`);
    }
    this.apiKey = apiKey;

    if (userLogger && logging.validateLogger(userLogger)) {
      this.logger = userLogger;
      this.logger.info(`Detected logger, using it.`);
    }

    this.logger.info(`Carter initialised.`);
  }

  // INTERACTION
  // ========================

  /**
   * Say something to carter, takes a query parameter containing your message, as well as an options object (optional). Will create a uuid automatically if one is not provided.
   */
  async say(text: string, playerId?: string): Promise<CarterInteraction> {
    if (!text || typeof text !== 'string') {
      throw Error(`Carter.say() requires a string as the first parameter. Received: ${text}.`);
    }

    if (!playerId) {
      playerId = uuidv1();
    } else if (playerId && typeof playerId !== 'string') {
      throw Error(`Carter.say() requires a string as the second parameter. Received: ${playerId}.`);
    }

    const interactionID = uuidv1();
    this.logger.debug(`Carter.say() called with text: ${text} and playerId: ${playerId}.`, { interactionID });
    const start = now();
    const triggeredSkills: CarterSkillInstance[] = [];
    const executedSkills: CarterSkillInstance[] = [];
    let data: CarterData;
    let interaction: CarterInteraction;

    const payload: CarterPayload = {
      key: this.apiKey,
      text,
      playerId,
    };
    const response = await fetch(URLS.say, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      try {
        data = (await response.json()) as CarterData;
      } catch (e) {
        this.logger.error(`Carter.say() failed to parse response as JSON.`, { interactionID });
        return {
          id: interactionID,
          data: undefined,
          ok: response.ok,
          statusCode: response.status,
          statusMessage: response.statusText,
          payload,
          triggeredSkills: [],
          executedSkills: [],
          timeTaken: Math.round(now() - start),
        };
      }
    } else {
      this.logger.error(`Carter.say() received a ${response.status} response. Status text: ${response.statusText}.`, {
        interactionID,
      });
      return {
        id: interactionID,
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        payload,
        triggeredSkills: [],
        executedSkills: [],
        timeTaken: Math.round(now() - start),
      };
    }

    for (const behaviour of data.forced_behaviours) {
      this.logger.debug(`Carter.say() found a forced behaviour: ${behaviour.name}. Checking for registered skill.`, {
        interactionID,
      });
      const skill = this.findSkill(behaviour.name);
      let newOutput;
      if (skill) {
        const skillInstance = new CarterSkillInstance(skill, data.output.text);
        if (skill.options.auto) {
          this.logger.debug(
            `Carter.say() found a registered skill for ${behaviour.name} with auto set to true. Executing and adding to triggered skills.`,
            { interactionID },
          );
          newOutput = await skillInstance.execute();
          if (newOutput) {
            data.output.text = newOutput;
          }
          executedSkills.push(skillInstance);
        } else {
          this.logger.debug(
            `Carter.say() found a registered skill for ${behaviour.name} with auto set to false. Adding to triggered skills.`,
            { interactionID },
          );
          triggeredSkills.push(skillInstance);
        }
      }
    }

    interaction = {
      id: interactionID,
      data,
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      payload,
      triggeredSkills,
      executedSkills,
      timeTaken: Math.round(now() - start),
    };
    const newConversationEntry: CarterConversationEntry = {
      isoTimestamp: DateTime.now().toISO(),
      interaction,
    };
    this.history.unshift(newConversationEntry);
    this.logger.debug(`Carter.say() finished.`, { interactionID });
    return interaction;
  }

  // Start a conversation with Carter
  async opener(playerId?: string): Promise<CarterOpenerInteraction> {
    if (playerId && typeof playerId !== 'string') {
      throw Error(`Carter.opener() requires a string as the first parameter. Received: ${playerId}.`);
    }
    if (!playerId) {
      playerId = uuidv1();
    }
    const interactionID = uuidv1();
    this.logger.debug(`Carter.opener() called with playerId: ${playerId}.`, { interactionID });
    const start = now();
    let data: CarterOpenerData;
    const payload = {
      key: this.apiKey,
      playerId,
    };
    const response = await fetch(URLS.opener, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      this.logger.error(
        `Carter.opener() received a ${response.status} response. Status text: ${response.statusText}.`,
        { interactionID },
      );
      return {
        id: interactionID,
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        timeTaken: Math.round(now() - start),
      };
    }

    try {
      data = (await response.json()) as CarterOpenerData;
    } catch (e) {
      this.logger.error(`Carter.opener() failed to parse response as JSON.`, { interactionID });
      return {
        id: interactionID,
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        timeTaken: Math.round(now() - start),
      };
    }

    const interaction: CarterOpenerInteraction = {
      id: interactionID,
      data,
      ok: response.ok,
      statusCode: response.status,
      statusMessage: response.statusText,
      timeTaken: Math.round(now() - start),
    };
    this.logger.debug(`Carter.opener() finished.`, { interactionID });
    return interaction;
  }

  // Personalise text with Carter
  async personalise(text: string): Promise<CarterPersonaliseInteraction> {
    if (!text || typeof text !== 'string') {
      throw Error(`Carter.personalise() requires a string as the first parameter. Received: ${text}.`);
    }

    const interactionID = uuidv1();
    this.logger.debug(`Carter.personalise() called with text: ${text}.`, { interactionID });
    const start = now();
    const payload = {
      key: this.apiKey,
      text,
    };
    const response = await fetch(URLS.personalise, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      this.logger.error(
        `Carter.personalise() received a ${response.status} response. Status text: ${response.statusText}.`,
        { interactionID },
      );
      return {
        id: interactionID,
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        timeTaken: Math.round(now() - start),
      };
    }

    try {
      const data = (await response.json()) as CarterData;
      this.logger.debug(`Carter.personalise() finished.`, { interactionID });
      return {
        id: interactionID,
        data,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        timeTaken: Math.round(Math.round(now() - start)),
      };
    } catch (e) {
      this.logger.error(`Carter.personalise() failed to parse response as JSON.`, { interactionID });
      return {
        id: interactionID,
        data: undefined,
        ok: response.ok,
        statusCode: response.status,
        statusMessage: response.statusText,
        timeTaken: Math.round(Math.round(now() - start)),
      };
    }
  }

  // SKILLS
  // =====================

  registerSkill(name: string, action: CarterSkillAction, options?: CarterSkillOptions): CarterSkill | undefined {
    if (!name || typeof name !== 'string') {
      throw Error(`Carter.registerSkill() requires a string as the first parameter. Received: ${name}.`);
    }
    if (!action || !isCarterSkillAction(action)) {
      throw Error(
        `Carter.registerSkill() requires a function as the second parameter. Received: ${action}. This function is called with one parameter, the carter response text`,
      );
    }
    if (options && !isCarterSkillOptions(options)) {
      throw Error(
        `Carter.registerSkill() requires valid CarterSkillOptions as the third parameter. Received: ${options}.`,
      );
    }

    this.logger.debug(`Carter.registerSkill() called with name: ${name}.`);
    const existing = this.findSkill(name);
    if (existing) {
      throw new Error(`A skill with the name ${name} already exists.`);
    } else {
      const skill: CarterSkill = { name, action, options: options ? options : {} };
      this.skills.push(skill);
      this.logger.debug(`Carter.registerSkill() finished. Registered skill with name: ${name}.`);
      return skill;
    }
  }

  findSkill(name: string): CarterSkill | undefined {
    if (!name || typeof name !== 'string') {
      throw Error(`Carter.findSkill() requires a string as the first parameter. Received: ${name}.`);
    }

    const skill = this.skills.find((value) => value.name === name);
    return skill;
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
    return this.latest()?.interaction.timeTaken;
  }

  /**
   * Returns the average response time for a given number of minutes if given. If not given, the average response time for your the entire history is returned. If there is either no history or no interactions in the given time period, the return value will be undefined.
   */
  averageResponseTime(minutes?: number): number | undefined {
    if (minutes && typeof minutes !== 'number') {
      throw Error(`Carter.averageResponseTime() requires a number as the first parameter. Received: ${minutes}.`);
    }

    this.logger.debug(`Carter.averageResponseTime() called with minutes: ${minutes}.`);

    const times: number[] = [];
    if (minutes) {
      const lowerBound = DateTime.now().minus({ minutes });
      for (const entry of this.history) {
        const dt = DateTime.fromISO(entry.isoTimestamp);
        if (dt > lowerBound && entry.interaction.timeTaken) {
          times.push(entry.interaction.timeTaken);
        }
      }
      if (times.length > 0) {
        this.logger.debug(`Taking average of ${times.length} times.`);
        const total = times.reduce((a, b) => a + b);
        const average = total / times.length;
        return average;
      } else {
        this.logger.debug(`No times found in the given time period.`);
        return undefined;
      }
    } else {
      for (const entry of this.history) {
        const dt = DateTime.fromISO(entry.isoTimestamp);
        if (entry.interaction.timeTaken) {
          times.push(entry.interaction.timeTaken);
        }
      }
      if (times.length > 0) {
        this.logger.debug(`Taking average of ${times.length} times.`);
        const total = times.reduce((a, b) => a + b);
        const average = total / times.length;
        return average;
      } else {
        this.logger.debug(`No times found in the given time period.`);
        return undefined;
      }
    }
  }
}
