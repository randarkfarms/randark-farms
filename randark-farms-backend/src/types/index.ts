import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export type UserRole = 'admin';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
}