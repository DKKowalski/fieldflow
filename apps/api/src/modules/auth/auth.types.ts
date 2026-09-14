import type { Request } from 'express';

export type UserRole = 'dispatcher' | 'technician';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
