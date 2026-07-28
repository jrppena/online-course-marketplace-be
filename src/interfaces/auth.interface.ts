import type { AppAbility } from '@config/authorization';
import type { Request } from 'express';
import type { User } from '@/generated/prisma/client';

export interface FirebaseAuthClaims {
  uid: string;
  email?: string;
  name?: string;
}

export interface RequestWithUser extends Request {
  user: FirebaseAuthClaims;
}

export interface RequestWithAbility extends RequestWithUser {
  ability: AppAbility;
  profile: User;
}
