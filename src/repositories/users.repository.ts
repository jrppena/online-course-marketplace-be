import { prisma } from '@config/prisma';
import type { User } from '@/generated/prisma/client';

export interface NewProfileData {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class UsersRepository {
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { firebaseUid } });
  }

  async create(data: NewProfileData): Promise<User> {
    return prisma.user.create({ data });
  }

  async upsert(data: NewProfileData): Promise<User> {
    const identityUpdate: Partial<NewProfileData> = {};
    // splitName always yields a non-empty fallback, so this guard only omits empty email — assumes Firebase's name claim persists once set via updateProfile
    if (data.email) identityUpdate.email = data.email;
    if (data.firstName) identityUpdate.firstName = data.firstName;
    if (data.lastName) identityUpdate.lastName = data.lastName;

    return prisma.user.upsert({
      where: { firebaseUid: data.firebaseUid },
      create: data,
      update: identityUpdate,
    });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }
}
