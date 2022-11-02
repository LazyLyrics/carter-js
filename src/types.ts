export interface CarterInteraction {
  data: CarterData;
  payload: CarterPayload;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
}

export function isACarterInteraction(obj: any): obj is CarterInteraction {
  return 'data' in obj && 'ok' in obj && 'statusCode' in obj && 'statusMessage' in obj && 'payload' in obj;
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
  time_takem: number;
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
  return 'isoString' in obj && 'request' in obj && 'responseData' in obj;
}
