import { DateTime } from 'luxon';
import { v1 as uuidv1 } from 'uuid';
import now from 'performance-now';

// INTERFACE TYPES

export interface Logger {
  debug: (message: string, metadata?: Record<string, unknown>) => void;
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
}

export interface CarterInteraction {
  type: string;
  characterName?: string
  id: string;
  payload: CarterPayload | CarterOpenerPayload | CarterPersonalisePayload;
  carterData: CarterData | null;
  timeTaken: number;
  isoTimestamp: string;
  url: string | null;
  ok: boolean | null;
  statusCode: number | null;
  statusMessage: string | null;

  outputText: string | null;
  outputAudio: string | null;
  forcedBehaviours: ForcedBehaviour[] | null;
  triggeredSkills: CarterSkillInstance[] | null;
  executedSkills?: CarterSkillInstance[] | null;
}

export type InteractionData = {
  id: string;
  type: string;
  response: Response | null;
  carterData: CarterData | null;
  start: number;
  payload: CarterPayload | CarterOpenerPayload | CarterPersonalisePayload;
  triggeredSkills: CarterSkillInstance[] | null;
  executedSkills: CarterSkillInstance[] | null;
  errorMessage: string | null;
}

export async function buildInteraction(interactionData: InteractionData): Promise<CarterInteraction> {
  const { id, type, response, carterData, payload, start, triggeredSkills, executedSkills } = interactionData;

  const interaction = {
    type,
    characterName: carterData?.agent?.name,
    id: id,
    payload,
    carterData,
    timeTaken: Math.round(now() - start),
    isoTimestamp: DateTime.now().toISO(),
    url: response?.url ? response.url : null,
    ok: response?.ok ? response.ok : false,
    statusCode: response?.status || null,
    statusMessage: response?.statusText || null,

    outputText: carterData?.output.text || null,
    outputAudio: carterData?.output.audio || null,
    forcedBehaviours: carterData?.forced_behaviours || null,
    triggeredSkills: triggeredSkills,
    executedSkills: executedSkills
  };

  return interaction
}

export interface ForcedBehaviour {
  name: string;
}

export interface CarterData {
  sentence?: string;
  content?: string;
  output: {
    text: string;
    audio: string | null;
  };
  agent: {
    name: string;
  }
  input?: string;
  forced_behaviours?: ForcedBehaviour[];
}

export interface CarterPayload {
  key: string;
  text: string;
  playerId: string;
  speak: boolean;
}

export interface CarterOpenerPayload {
  key: string;
  playerId: string;
  speak: boolean;
}

export interface CarterPersonalisePayload {
  key: string;
  text: string;
  speak: boolean;
}

export type CarterSkill = {
  name: string;
  action: CarterSkillAction;
  auto?: boolean;
};

export type CarterSkillAction = (
  response: string,
) => Promise<CarterSkillOutput> | CarterSkillOutput | Promise<void> | void;

export interface CarterSkillOutput {
  output: string;
  skillData?: any;
}

export class CarterSkillInstance {
  name: string;
  execute;
  skillData?: any;
  output: string;
  executed: boolean = false;
  errors: string[] = [];

  constructor(skill: CarterSkill, output: string) {
    this.name = skill.name;
    this.output = output;
    this.skillData = undefined;

    this.execute = async () => {
      const newOutput = await skill.action(output);
      if (newOutput) {
        this.output = newOutput.output;
        this.skillData = newOutput.skillData ? newOutput.skillData : undefined;
        this.executed = true;
        return this.output;
      } else {
        this.executed = true;
        return this.output;
      }
    };
  }
}

// TYPE GUARDS

export function isLogger(obj: any): obj is Logger {
  return (
    typeof obj === 'object' &&
    typeof obj.debug === 'function' &&
    typeof obj.info === 'function' &&
    typeof obj.warn === 'function' &&
    typeof obj.error === 'function'
  );
}

export function isInteractionData(obj: any): obj is InteractionData {
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    obj.response instanceof Response &&
    (obj.carterData === undefined || isCarterData(obj.carterData)) &&
    typeof obj.start === 'number' &&
    (isCarterPayload(obj.payload) || isCarterOpenerPayload(obj.payload) || isCarterPersonalisePayload(obj.payload)) &&
    (obj.triggeredSkills === undefined || (Array.isArray(obj.triggeredSkills) && obj.triggeredSkills.every((skill: any) => isCarterSkillInstance(skill)))) &&
    (obj.executedSkills === undefined || (Array.isArray(obj.executedSkills) && obj.executedSkills.every((skill: any) => isCarterSkillInstance(skill))))
  );
}

export function isCarterInteraction(obj: any): obj is CarterInteraction {
  return (
    typeof obj.type === 'string' &&
    (obj.characterName === undefined || typeof obj.characterName === 'string') &&
    typeof obj.id === 'string' &&
    (isCarterPayload(obj.payload) || isCarterOpenerPayload(obj.payload) || isCarterPersonalisePayload(obj.payload)) &&
    (obj.carterData === null || isCarterData(obj.carterData)) &&
    typeof obj.timeTaken === 'number' &&
    typeof obj.isoTimestamp === 'string' &&
    (obj.url === null || typeof obj.url === 'string') &&
    (obj.ok === null || typeof obj.ok === 'boolean') &&
    (obj.statusCode === null || typeof obj.statusCode === 'number') &&
    (obj.statusMessage === null || typeof obj.statusMessage === 'string') &&
    (obj.outputText === null || typeof obj.outputText === 'string') &&
    (obj.outputAudio === null || typeof obj.outputAudio === 'string') &&
    (obj.forcedBehaviours === null || Array.isArray(obj.forcedBehaviours) && obj.forcedBehaviours.every((fb: any) => isForcedBehaviour(fb))) &&
    (obj.triggeredSkills === null || Array.isArray(obj.triggeredSkills) && obj.triggeredSkills.every((skill: any) => isCarterSkillInstance(skill))) &&
    (obj.executedSkills === undefined || obj.executedSkills === null || Array.isArray(obj.executedSkills) && obj.executedSkills.every((skill: any) => isCarterSkillInstance(skill)))
  );
}

export function isCarterData(obj: any): obj is CarterData {
  return (
    (obj.sentence === undefined || typeof obj.sentence === 'string') &&
    (obj.content === undefined || typeof obj.content === 'string') &&
    typeof obj.output.text === 'string' &&
    (obj.output.audio === null || typeof obj.output.audio === 'string') &&
    typeof obj.agent.name === 'string' &&
    (obj.input === undefined || typeof obj.input === 'string') &&
    (obj.forced_behaviours === undefined || Array.isArray(obj.forced_behaviours) && obj.forced_behaviours.every((fb: any) => isForcedBehaviour(fb)))
  );
}



export function isForcedBehaviour(obj: any): obj is ForcedBehaviour {
  return typeof obj.name === 'string';
}

export function isCarterPayload(obj: any): obj is CarterPayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.playerId === 'string' &&
    typeof obj.speak === 'boolean'
  );
}

export function isCarterOpenerPayload(obj: any): obj is CarterOpenerPayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.playerId === 'string' &&
    typeof obj.speak === 'boolean'
  );
}

export function isCarterPersonalisePayload(obj: any): obj is CarterPersonalisePayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.speak === 'boolean'
  );
}

export function isCarterSkillOutput(obj: any): obj is CarterSkillOutput {
  return (
    typeof obj.output === 'string' &&
    (obj.skillData === undefined || typeof obj.skillData === 'object')
  );
}

export function isCarterSkillAction(obj: any): obj is CarterSkillAction {
  return typeof obj === 'function';
}


export function isCarterSkillInstance(obj: any): obj is CarterSkillInstance {
  return (
    typeof obj.name === 'string' &&
    typeof obj.execute === 'function' &&
    (obj.skillData === undefined || typeof obj.skillData === 'object') &&
    typeof obj.output === 'string'
  );
}

export function isCarterSkill(obj: any): obj is CarterSkill {
  return (
    typeof obj.name === 'string' &&
    typeof obj.action === 'function' &&
    (obj.auto === undefined || typeof obj.auto === 'boolean')
  );
}
