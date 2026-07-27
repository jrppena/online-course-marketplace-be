import type { Request } from 'express';

export interface FirebaseAuthClaims {
  uid: string;
  email?: string;
  name?: string;
}

export interface RequestWithUser extends Request {
  user: FirebaseAuthClaims;
}
