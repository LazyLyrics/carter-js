export interface CarterResponse {
  data: any
  ok: boolean,
  statusCode: number,
  statusMessage: string,
  payload: CarterPayload
}

export interface CarterPayload {
  api_key: string,
  query: string,
  uuid?: string,
  scene?: string
}
