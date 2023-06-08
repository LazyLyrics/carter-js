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
  characterName: string | null;
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
};

export async function buildInteraction(interactionData: InteractionData): Promise<CarterInteraction> {
  const { id, type, response, carterData, payload, start, triggeredSkills, executedSkills } = interactionData;

  const interaction = {
    type,
    characterName: carterData?.agent?.name ? carterData.agent.name : null,
    id,
    payload,
    carterData,
    timeTaken: Math.round(now() - start),
    isoTimestamp: DateTime.now().toISO(),
    url: response?.url || null,
    ok: response?.ok || false,
    statusCode: response?.status || null,
    statusMessage: response?.statusText || null,

    outputText: carterData?.output?.text || null,
    outputAudio: carterData?.output?.audio || null,
    forcedBehaviours: carterData?.forced_behaviours || null,
    triggeredSkills,
    executedSkills,
  };

  return interaction;
}

export interface ForcedBehaviour {
  name: string;
}

export interface CarterData {
  sentence?: string;
  content?: string;
  output: {
    text: string | null;
    audio: string | null;
  };
  agent: {
    name: string;
  };
  input?: string;
  forced_behaviours?: ForcedBehaviour[];
}

export interface CarterPayload {
  key: string;
  text: string;
  user_id: string;
  speak: boolean;
}

export interface CarterOpenerPayload {
  key: string;
  user_id: string;
  speak: boolean;
  personal: boolean;
}

export interface CarterPersonalisePayload {
  key: string;
  text: string;
  speak: boolean;
  user_id: string;
}

export type CarterSkill = {
  name: string;
  action: CarterSkillAction;
  auto?: boolean;
};

export type CarterSkillAction = (
  response: string | null,
) => Promise<CarterSkillOutput> | CarterSkillOutput | Promise<void> | void;

export interface CarterSkillOutput {
  output: string;
  skillData?: any;
}

export class CarterSkillInstance {
  name: string;
  execute;
  skillData?: any;
  output: string | null;
  executed: boolean = false;
  errors: string[] = [];

  constructor(skill: CarterSkill, output: string | null) {
    this.name = skill.name;
    this.output = output;
    this.skillData = undefined;

    this.execute = async () => {
      const newOutput = await skill.action(output);
      if (newOutput) {
        this.output = newOutput.output;
        this.skillData = newOutput.skillData ? newOutput.skillData : null;
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

export function isCarterInteraction(obj: any): obj is CarterInteraction {
  return (
    typeof obj.type === 'string' &&
    (typeof obj.characterName === 'string' || obj.characterName === null) &&
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
    (obj.forcedBehaviours === null || isArrayOfType(obj.forcedBehaviours, isForcedBehaviour)) &&
    (obj.triggeredSkills === null || isArrayOfType(obj.triggeredSkills, isCarterSkillInstance)) &&
    (obj.executedSkills === null || isArrayOfType(obj.executedSkills, isCarterSkillInstance))
  );
}

// export function isCarterInteraction(obj: any): obj is CarterInteraction {
//   function printMessage(message: string): void {
//     console.log(message);
//   }

//   if (typeof obj.type !== 'string') {
//     printMessage('Failed check: obj.type should be a string');
//     return false;
//   }
//   if (typeof obj.characterName !== 'string' && obj.characterName !== null) {
//     printMessage('Failed check: obj.characterName should be a string or null');
//     return false;
//   }
//   if (typeof obj.id !== 'string') {
//     printMessage('Failed check: obj.id should be a string');
//     return false;
//   }
//   if (
//     !isCarterPayload(obj.payload) &&
//     !isCarterOpenerPayload(obj.payload) &&
//     !isCarterPersonalisePayload(obj.payload)
//   ) {
//     printMessage('Failed check: obj.payload should be a valid payload');
//     return false;
//   }
//   if (obj.carterData !== null && !isCarterData(obj.carterData)) {
//     printMessage('Failed check: obj.carterData should be null or a valid CarterData');
//     return false;
//   }
//   if (typeof obj.timeTaken !== 'number') {
//     printMessage('Failed check: obj.timeTaken should be a number');
//     return false;
//   }
//   if (typeof obj.isoTimestamp !== 'string') {
//     printMessage('Failed check: obj.isoTimestamp should be a string');
//     return false;
//   }
//   if (obj.url !== null && typeof obj.url !== 'string') {
//     printMessage('Failed check: obj.url should be null or a string');
//     return false;
//   }
//   if (obj.ok !== null && typeof obj.ok !== 'boolean') {
//     printMessage('Failed check: obj.ok should be null or a boolean');
//     return false;
//   }
//   if (obj.statusCode !== null && typeof obj.statusCode !== 'number') {
//     printMessage('Failed check: obj.statusCode should be null or a number');
//     return false;
//   }
//   if (obj.statusMessage !== null && typeof obj.statusMessage !== 'string') {
//     printMessage('Failed check: obj.statusMessage should be null or a string');
//     return false;
//   }
//   if (obj.outputText !== null && typeof obj.outputText !== 'string') {
//     printMessage('Failed check: obj.outputText should be null or a string');
//     return false;
//   }
//   if (obj.outputAudio !== null && typeof obj.outputAudio !== 'string') {
//     printMessage('Failed check: obj.outputAudio should be null or a string');
//     return false;
//   }
//   if (obj.forcedBehaviours !== null && !isArrayOfType(obj.forcedBehaviours, isForcedBehaviour)) {
//     printMessage('Failed check: obj.forcedBehaviours should be null or an array of ForcedBehaviour');
//     return false;
//   }
//   if (obj.triggeredSkills !== null && !isArrayOfType(obj.triggeredSkills, isCarterSkillInstance)) {
//     printMessage('Failed check: obj.triggeredSkills should be null or an array of CarterSkillInstance');
//     return false;
//   }
//   if (obj.executedSkills !== null && !isArrayOfType(obj.executedSkills, isCarterSkillInstance)) {
//     printMessage('Failed check: obj.executedSkills should be null or an array of CarterSkillInstance');
//     return false;
//   }

//   return true;
// }

export function isArrayOfType<T>(arr: any, typeGuard: (item: any) => item is T): arr is T[] {
  if (!Array.isArray(arr)) return false;
  for (const item of arr) {
    if (!typeGuard(item)) return false;
  }
  return true;
}

// Type guard for ForcedBehaviour
export function isForcedBehaviour(obj: any): obj is ForcedBehaviour {
  return typeof obj.name === 'string';
}

// Type guard for CarterData
export function isCarterData(obj: any): obj is CarterData {
  return (
    (obj.sentence === undefined || obj.sentence === null || typeof obj.sentence === 'string') &&
    (obj.content === undefined || obj.content === null || typeof obj.content === 'string') &&
    (typeof obj.output.text === 'string' || obj.output.text === null) &&
    (obj.output.audio === null || typeof obj.output.audio === 'string') &&
    (obj.input === undefined || typeof obj.input === 'string') &&
    (obj.forced_behaviours === undefined || isArrayOfType(obj.forced_behaviours, isForcedBehaviour))
  );
}

// export function isCarterData(obj: any): obj is CarterData {
//   function printMessage(message: string): void {
//     console.log(message);
//   }

//   if (obj.sentence !== undefined && obj.sentence !== null && typeof obj.sentence !== 'string') {
//     printMessage('Failed check: obj.sentence should be undefined or a string - ' + obj.sentence);
//     return false;
//   }
//   if (obj.content !== undefined && obj.content !== null && typeof obj.content !== 'string') {
//     printMessage('Failed check: obj.content should be undefined or a string - ' + obj.content);
//     return false;
//   }
//   if (typeof obj.output.text !== 'string' && obj.output.text !== null) {
//     printMessage('Failed check: obj.output.text should be a string');
//     return false;
//   }
//   if (obj.output.audio !== null && typeof obj.output.audio !== 'string') {
//     printMessage('Failed check: obj.output.audio should be null or a string');
//     return false;
//   }
//   if (typeof obj.agent.name !== 'string') {
//     printMessage('Failed check: obj.agent.name should be a string');
//     return false;
//   }
//   if (obj.input !== undefined && typeof obj.input !== 'string') {
//     printMessage('Failed check: obj.input should be undefined or a string - ' + obj.input);
//     return false;
//   }
//   if (obj.forced_behaviours !== undefined && !isArrayOfType(obj.forced_behaviours, isForcedBehaviour)) {
//     printMessage('Failed check: obj.forced_behaviours should be undefined or an array of ForcedBehaviour');
//     return false;
//   }

//   return true;
// }

// Type guard for CarterPayload
export function isCarterPayload(obj: any): obj is CarterPayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.speak === 'boolean'
  );
}

// Type guard for CarterOpenerPayload
export function isCarterOpenerPayload(obj: any): obj is CarterOpenerPayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.speak === 'boolean' &&
    typeof obj.personal === 'boolean'
  );
}

// Type guard for CarterPersonalisePayload
export function isCarterPersonalisePayload(obj: any): obj is CarterPersonalisePayload {
  return (
    typeof obj.key === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.speak === 'boolean' &&
    typeof obj.user_id === 'string'
  );
}

// Type guard for CarterSkill
export function isCarterSkill(obj: any): obj is CarterSkill {
  return (
    typeof obj.name === 'string' &&
    typeof obj.action === 'function' &&
    (obj.auto === undefined || typeof obj.auto === 'boolean')
  );
}

// Type guard for CarterSkillAction
export function isCarterSkillAction(obj: any): obj is CarterSkillAction {
  return typeof obj === 'function';
}

// Type guard for CarterSkillOutput
export function isCarterSkillOutput(obj: any): obj is CarterSkillOutput {
  return typeof obj.output === 'string' && (obj.skillData === undefined || typeof obj.skillData !== 'undefined');
}

export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

// Type guard for CarterSkillInstance
export function isCarterSkillInstance(obj: any): obj is CarterSkillInstance {
  return (
    typeof obj.name === 'string' &&
    typeof obj.execute === 'function' &&
    (obj.skillData === undefined || typeof obj.skillData !== 'undefined') &&
    typeof obj.output === 'string' &&
    typeof obj.executed === 'boolean' &&
    isArrayOfType(obj.errors, isString)
  );
}
