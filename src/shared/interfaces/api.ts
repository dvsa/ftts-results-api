export interface ResultResponse {
  code: number;
  reason: string;
}

export function respond(code: number, reason: string): ResultResponse {
  return { code, reason };
}

export function respondInternalError(): ResultResponse {
  return { code: 500, reason: 'Internal server error' };
}

export class ValidationError extends Error { }
