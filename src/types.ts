export interface CarterJSResponse {
  data: CarterData;
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  payload: CarterPayload;
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

export interface CarterQueryOptions {
  uuid?: string;
  scene?: string;
}

export interface CarterConversationEntry {
  isoString: string,
  request: CarterPayload,
  responseData: CarterData
}
