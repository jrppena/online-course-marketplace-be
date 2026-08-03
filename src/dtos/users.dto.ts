import type { RawRuleOf } from '@casl/ability';
import type { PackRule } from '@casl/ability/extra';
import { packRules } from '@casl/ability/extra';
import type { AppAbility } from '@config/authorization';
import { defineRulesFor } from '@config/authorization';
import type { User } from '@/generated/prisma/client';

export interface UserResponse {
  id: string;
  createdAt: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  bio: string;
  rules: PackRule<RawRuleOf<AppAbility>>[];
}

// Shape must match online-course-marketplace-fe's src/types/api.ts `User` type exactly.
export const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  createdAt: user.createdAt.getTime(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  bio: user.bio,
  rules: packRules(defineRulesFor(user)),
});
