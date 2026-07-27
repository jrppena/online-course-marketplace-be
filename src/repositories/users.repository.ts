import { prisma } from '@config/prisma';
import type { User } from '@/generated/prisma/client';

export interface NewProfileData {
  id: string; // Firebase uid
  email: string;
  firstName: string;
  lastName: string;
}

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: NewProfileData): Promise<User> {
    return prisma.user.create({ data });
  }
}
