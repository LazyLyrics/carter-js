import {
  CarterPayload,
  CarterInteraction,
  CarterSkill,
  buildInteraction,
  CarterSkillInstance,
  CarterData,
  Logger,
  isCarterSkill,
  CarterOpenerPayload,
  CarterPersonalisePayload,
  ForcedBehaviour,
} from './types';
import { v1 as uuidv1 } from 'uuid';
import { DateTime } from 'luxon';
import now from 'performance-now';
import * as logging from './logger';

export const URLS = {
  say: 'https://api.carterlabs.ai//api/chat',
  personalise: 'https://api.carterlabs.ai//api/personalise',
  opener: 'https://api.carterlabs.ai//api/opener  ',
};

/**
 * Contains methods for interacting with Carter.
 */
class Carter {
  apiKey: string;
  history: CarterInteraction[] = [];
  skills: CarterSkill[] = [];
  logger: Logger = new logging.NoOpLogger();
  speakDefault: boolean = false;

  constructor(apiKey: string, userLogger?: Logger, speak?: boolean) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw Error(`Carter constructor requires a string as the first parameter. Received: ${apiKey}.`);
    }
    this.apiKey = apiKey;

    if (userLogger && logging.validateLogger(userLogger)) {
      this.logger = userLogger;
      this.logger.info(`Detected logger, using it.`);
    }

    if (speak && typeof speak === 'boolean') {
      this.speakDefault = speak;
    }

    this.logger.info(`Carter initialised.`);
  }

  // INTERACTION
  // ========================

  // --------------------------------
  // SAY
  // --------------------------------
  async say(text: string, userId?: string, speak?: boolean): Promise<CarterInteraction> {
    if (!text || typeof text !== 'string') {
      throw Error(`Carter.say() requires a string as the first parameter. Received: ${text}.`);
    }

    if (!userId) {
      userId = uuidv1();
    } else if (userId && typeof userId !== 'string') {
      throw Error(`Carter.say() requires a string as the second parameter. Received: ${userId}.`);
    }

    if (speak) {
      if (typeof speak !== 'boolean') {
        throw Error(`Carter.say() requires a boolean as speak parameter. Received: ${speak}.`);
      }
    } else {
      speak = this.speakDefault as boolean;
    }

    const interactionID = uuidv1();
    this.logger.debug(`Carter.say() called with text: ${text} and userId: ${userId}.`, { interactionID });
    const start = now();
    const triggeredSkills: CarterSkillInstance[] = [];
    const executedSkills: CarterSkillInstance[] = [];
    let response: Response | null = null;
    let data: CarterData | null = null;
    let interaction: CarterInteraction;
    let errorMessage: string | null = null;

    const payload: CarterPayload = {
      key: this.apiKey,
      text,
      user_id: userId,
      speak,
    };
    try {
      response = await fetch(URLS.say, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      this.logger.warn(`Carter.say() failed to fetch.`, { interactionID });
      errorMessage = (e as Error).message;
      response = null;
    }
    if (response) {
      try {
        data = (await response.json()) as CarterData;
      } catch (e) {
        data = null;
        this.logger.warn(`Carter.say() failed to parse response as JSON.`, { interactionID });
      }
    }
    if (response && data && data.forced_behaviours) {
      for (const behaviour of data.forced_behaviours as ForcedBehaviour[]) {
        this.logger.debug(`Carter.say() found a forced behaviour: ${behaviour.name}. Checking for registered skill.`, {
          interactionID,
        });
        const skill = this.findSkill(behaviour.name);
        let newOutput;
        if (skill) {
          const skillInstance = new CarterSkillInstance(skill, data.output.text);
          if (skill.auto) {
            this.logger.debug(
              `Carter.say() found a registered skill for ${behaviour.name} with auto set to true. Executing and adding to triggered skills.`,
              { interactionID },
            );
            try {
              newOutput = await skillInstance.execute();
            } catch (e) {
              this.logger.warn(`Carter.say() failed to execute skill.`, { interactionID });
              skillInstance.errors.push((e as Error).message);
            }
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
    }

    interaction = await buildInteraction({
      id: interactionID,
      type: 'say',
      response,
      carterData: data,
      payload,
      start,
      triggeredSkills,
      executedSkills,
      errorMessage: null,
    });
    this.history.unshift(interaction);
    this.logger.debug(`Carter.say() finished.`, { interactionID });
    return interaction;
  }

  // ---------------------------------
  // OPENER
  // ---------------------------------
  async opener(userId?: string, speak?: boolean | undefined): Promise<CarterInteraction> {
    if (userId && typeof userId !== 'string') {
      throw Error(`Carter.opener() requires a string as the first parameter. Received: ${userId}.`);
    }
    if (!userId) {
      userId = uuidv1();
    }
    if (speak) {
      if (typeof speak !== 'boolean') {
        throw Error(`Carter.opener() requires a boolean as speak parameter. Received: ${speak}.`);
      }
    } else {
      speak = this.speakDefault as boolean;
    }

    const interactionID = uuidv1();
    this.logger.debug(`Carter.opener() called with userId: ${userId}.`, { interactionID });
    const start = now();
    let data: CarterData | null = null;
    let errorMessage: string | null = null;
    let response: Response | null = null;
    const payload: CarterOpenerPayload = {
      key: this.apiKey,
      user_id: userId,
      speak,
      personal: true,
    };
    try {
      response = await fetch(URLS.opener, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      this.logger.warn(`Carter.opener() failed to fetch.`, { interactionID });
      errorMessage = (e as Error).message;
    }
    if (response) {
      try {
        data = await response.json();
      } catch (e) {
        this.logger.warn(`Carter.opener() failed to parse response as JSON.`, { interactionID });
      }
    }

    const interaction = await buildInteraction({
      id: interactionID,
      type: 'opener',
      response,
      carterData: data,
      payload,
      start,
      triggeredSkills: null,
      executedSkills: null,
      errorMessage,
    });

    this.logger.debug(`Carter.opener() finished.`, { interactionID });
    return interaction;
  }

  // ---------------------------------
  // PERSONALISE
  // ---------------------------------
  async personalise(text: string, userId: string, speak?: boolean | undefined): Promise<CarterInteraction> {
    if (!text || typeof text !== 'string') {
      throw Error(`Carter.personalise() requires a string as the first parameter. Received: ${text}.`);
    }
    if (speak) {
      if (typeof speak !== 'boolean') {
        throw Error(`Carter.personalise() requires a boolean as speak parameter. Received: ${speak}.`);
      }
    } else {
      speak = this.speakDefault as boolean;
    }
    const interactionID = uuidv1();
    this.logger.debug(`Carter.personalise() called with text: ${text}.`, { interactionID });
    const start = now();
    let data: CarterData | null = null;
    let response: Response | null = null;
    let errorMessage: string | null = null;
    const payload: CarterPersonalisePayload = {
      key: this.apiKey,
      text,
      speak,
      user_id: userId,
    };

    try {
      response = await fetch(URLS.personalise, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      this.logger.warn(`Carter.personalise() failed to fetch.`, { interactionID });
      errorMessage = (error as Error).message;
    }
    if (response) {
      try {
        data = await response.json();
      } catch (e) {
        this.logger.warn(`Carter.personalise() failed to parse response as JSON.`, { interactionID });
        errorMessage = (e as Error).message;
      }
    }

    const interaction = await buildInteraction({
      id: interactionID,
      type: 'personalise',
      response,
      carterData: data,
      payload,
      start,
      triggeredSkills: null,
      executedSkills: null,
      errorMessage,
    });

    this.logger.debug(`Carter.personalise() finished.`, { interactionID });
    return interaction;
  }

  // SKILLS
  // =====================

  registerSkill(skill: CarterSkill): CarterSkill | undefined {
    if (!isCarterSkill(skill)) {
      throw new Error(`Incorrect skill format.`);
    }

    this.logger.debug(`Carter.registerSkill() called with name: ${skill.name}.`);
    const existing = this.findSkill(skill.name);
    if (existing) {
      throw new Error(`A skill with the name ${skill.name} already exists.`);
    } else {
      this.skills.push(skill);
      this.logger.debug(`Carter.registerSkill() finished. Registered skill with name: ${skill.name}.`);
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
  latest(): CarterInteraction | undefined {
    if (this.history.length > 0) {
      return this.history[0];
    } else {
      return undefined;
    }
  }

  /** Returns the response time of your last interaction with Carter */
  lastResponseTime(): number | undefined {
    return this.latest()?.timeTaken;
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
        if (dt > lowerBound && entry.timeTaken) {
          times.push(entry.timeTaken);
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
        if (entry.timeTaken) {
          times.push(entry.timeTaken);
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

module.exports = Carter;
export default Carter;
