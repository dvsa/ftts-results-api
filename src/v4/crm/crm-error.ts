import { RequestError } from 'dynamics-web-api';

export interface CrmError {
  status?: number;
}

export class CrmError extends Error {
  status?: number;

  constructor(error: RequestError | string) {
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message);
      this.status = error.status || 500;
    }
  }
}
