// INTERFACE TYPES

export interface Logger {
  debug: (message: string, metadata?: Record<string, unknown>) => void;
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
}

export interface CarterInteraction {
  id: string;
  data: CarterData | undefined;
  payload: CarterPayload;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  triggeredSkills: CarterSkillInstance[];
  executedSkills: CarterSkillInstance[];
  timeTaken: number;
}

export interface CarterOpenerInteraction {
  id: string;
  data: CarterOpenerData | undefined;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  timeTaken: number;
}
export interface CarterPersonaliseInteraction {
  id: string;
  data: CarterData | undefined;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  timeTaken: number;
}

export interface ForcedBehaviour {
  name: string;
}

export interface CarterData {
  output: {
    text: string;
  };
  input: string;
  forced_behaviours: ForcedBehaviour[];
}

export interface CarterOpenerData {
  sentence: string;
}
export interface CarterPersonaliseData {
  content: string;
}

export interface CarterPayload {
  key: string;
  text: string;
  playerId: string;
}

export interface CarterConversationEntry {
  isoTimestamp: string;
  interaction: CarterInteraction | CarterOpenerInteraction;
}

export interface CarterSkillOptions {
  auto?: boolean;
  asynchronous?: boolean;
}

export interface CarterSkillOutput {
  output: string;
  skillData?: any;
}

export type CarterSkillAction = (
  response: string,
) => Promise<CarterSkillOutput> | CarterSkillOutput | Promise<void> | void;

export type CarterTriggerEntity = { confidence: number; label: string; word: string };

export type CarterSkill = {
  name: string;
  action: CarterSkillAction;
  options: CarterSkillOptions;
};

export class CarterSkillInstance {
  name: string;
  execute;
  skillData: any;
  output: string;

  constructor(skill: CarterSkill, output: string) {
    this.name = skill.name;
    this.output = output;

    this.execute = async () => {
      const newOutput = await skill.action(output);
      if (newOutput) {
        this.output = newOutput.output;
        this.skillData = newOutput.skillData;
        return this.output;
      } else {
        return this.output;
      }
    };
  }
}

// TYPE GUARDS

export function isCarterInteraction(obj: any): obj is CarterInteraction {
  return (
    (obj.data === undefined || isCarterData(obj.data)) &&
    isCarterPayload(obj.payload) &&
    typeof obj.ok === 'boolean' &&
    typeof obj.statusCode === 'number' &&
    typeof obj.statusMessage === 'string' &&
    Array.isArray(obj.triggeredSkills) &&
    obj.triggeredSkills.every((skill: any) => isCarterSkillInstance(skill)) &&
    Array.isArray(obj.executedSkills) &&
    obj.executedSkills.every((skill: any) => isCarterSkillInstance(skill)) &&
    typeof obj.timeTaken === 'number'
  );
}

export function isCarterOpenerInteraction(obj: any): obj is CarterOpenerInteraction {
  return (
    (obj.data === undefined || isCarterOpenerData(obj.data)) &&
    typeof obj.ok === 'boolean' &&
    typeof obj.statusCode === 'number' &&
    typeof obj.statusMessage === 'string' &&
    typeof obj.timeTaken === 'number'
  );
}

export function isCarterPersonaliseInteraction(obj: any): obj is CarterPersonaliseInteraction {
  return (
    (obj.data === undefined || isCarterPersonaliseData(obj.data)) &&
    typeof obj.ok === 'boolean' &&
    typeof obj.statusCode === 'number' &&
    typeof obj.statusMessage === 'string' &&
    typeof obj.timeTaken === 'number'
  );
}

export function isCarterData(obj: any): obj is CarterData {
  return (
    typeof obj.output === 'object' &&
    typeof obj.output.text === 'string' &&
    typeof obj.input === 'string' &&
    Array.isArray(obj.forced_behaviours) &&
    obj.forced_behaviours.every((fb: any) => isForcedBehaviour(fb))
  );
}

export function isCarterOpenerData(obj: any): obj is CarterOpenerData {
  return typeof obj.sentence === 'string';
}

export function isCarterPersonaliseData(obj: any): obj is CarterPersonaliseData {
  return typeof obj.content === 'string';
}

export function isCarterPayload(obj: any): obj is CarterPayload {
  return typeof obj.key === 'string' && typeof obj.text === 'string' && typeof obj.playerId === 'string';
}

export function isCarterSkillInstance(obj: any): obj is CarterSkillInstance {
  return typeof obj.name === 'string' && typeof obj.execute === 'function' && typeof obj.output === 'string';
}

export function isForcedBehaviour(obj: any): obj is ForcedBehaviour {
  return typeof obj.name === 'string';
}

export function isCarterConversationEntry(obj: any): obj is CarterConversationEntry {
  return (
    (typeof obj.isoTimestamp === 'string' && isCarterInteraction(obj.interaction)) ||
    isCarterOpenerInteraction(obj.interaction)
  );
}

export function isCarterSkillOptions(obj: any): obj is CarterSkillOptions {
  return (
    (obj.auto === undefined || typeof obj.auto === 'boolean') &&
    (obj.asynchronous === undefined || typeof obj.asynchronous === 'boolean')
  );
}

export function isCarterSkillAction(obj: any): obj is CarterSkillAction {
  return typeof obj === 'function';
}
