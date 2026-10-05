import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
};