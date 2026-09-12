import type { Request } from 'express';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
