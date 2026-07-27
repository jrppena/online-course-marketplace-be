import type { User } from '@/generated/prisma/client';

export interface UserResponse {
  id: string;
  createdAt: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  bio: string;
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
});
