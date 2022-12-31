export interface CarterInteraction {
  data: CarterData | undefined;
  payload: CarterPayload;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  triggeredSkills: CarterSkillInstance[];
  executedSkills: CarterSkillInstance[];
}

export function isACarterInteraction(obj: any): obj is CarterInteraction {
  return (
    'data' in obj &&
    'ok' in obj &&
    'statusCode' in obj &&
    'statusMessage' in obj &&
    'payload' in obj &&
    'triggeredSkills' in obj &&
    'executedSkills' in obj
  );
}

export interface CarterPayload {
  api_key: string;
  query: string;
  uuid?: string;
  scene?: string;
}

export interface CarterData {
  input: string;
  triggers: {
    type: string;
    score: number;
    entities: {
      confidence: number;
      label: string;
      word: string;
    }[];
    metadata: object;
  }[];
  question: boolean;
  output: {
    text: string;
    supplier: string;
    voice: string;
  };
  sentiment: {
    input: {
      label: string;
      confidence: number;
    };
    output: {
      label: string;
      confidence: number;
    };
    conversation: {
      label: string;
      confidence: number;
    };
  };
  time_taken: number;
  credits_used: number;
  tid: string;
}

export interface CarterPayloadOptions {
  uuid?: string;
  scene?: string;
}

export interface CarterConversationEntry {
  isoTimestamp: string;
  interaction: CarterInteraction;
}

export function isAConversationEntry(obj: any): obj is CarterConversationEntry {
  return 'isoString' in obj && 'interaction' in obj;
}

export interface CarterSkillOptions {
  auto?: boolean;
  asynchronous?: boolean;
}

export interface CarterSkillOutput {
  output: string;
  skillData: any
}

export type CarterSkillAction = (
  response: string,
  metadata: unknown | undefined,
  entities: CarterTriggerEntity[] | undefined,
) => Promise<CarterSkillOutput> | Promise<string> | void;
export type CarterTriggerEntity = { confidence: number; label: string; word: string };

export type CarterSkill = {
  name: string;
  action: CarterSkillAction;
  options: CarterSkillOptions;
};

export class CarterSkillInstance {
  name: string;
  execute;
  metadata: any;
  skillData: any;
  entities: CarterTriggerEntity[];
  output: string;

  constructor(skill: CarterSkill, output: string, metadata: any, entities: CarterTriggerEntity[]) {
    this.name = skill.name;
    this.metadata = metadata;
    this.entities = entities;
    this.output = output;

    this.execute = async () => {
      const newOutput = await skill.action(output, metadata, entities);
      if (newOutput) {
        if (typeof newOutput === "string")
          this.output = newOutput;
        else {
          this.output = newOutput.output
          this.skillData = newOutput.skillData
        }
        return newOutput;
      } else {
        return this.output;
      }
    };
  }
}
