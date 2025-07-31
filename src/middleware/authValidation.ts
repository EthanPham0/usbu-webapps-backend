import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

import { Payload } from '@/types/Payload';
import { InvalidTokenError, MissingJWTSecretError } from '@/types/AuthErrors';

export function validateToken(req: NextRequest): Payload {
  const secret = process.env.JWT_SECRET;
  if (secret === null)
    throw new MissingJWTSecretError();

  const authHeader = req.headers.get('Authorization');
  if (authHeader === null || !authHeader.startsWith('Bearer '))
    throw new InvalidTokenError();

  const token = authHeader.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, secret!) as Payload;
  } catch (err) {
    throw new InvalidTokenError();
  }

  return decoded;
}
