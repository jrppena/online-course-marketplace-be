import type { FirebaseAuthClaims } from '@interfaces/auth.interface';
import { UsersRepository } from '@repositories/users.repository';
import { container } from 'tsyringe';
import type { User } from '@/generated/prisma/client';

const splitName = (name?: string, email?: string): { firstName: string; lastName: string } => {
  const source = name ?? email ?? 'New User';
  const [firstName, ...rest] = source.split(' ');
  return {
    firstName: firstName || 'New',
    lastName: rest.join(' ') || 'User',
  };
};

export class UsersService {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository?: UsersRepository) {
    this.usersRepository = usersRepository ?? container.resolve(UsersRepository);
  }

  // Firebase owns identity; this auto-provisions the app profile row on first sign-in.
  async getOrCreateProfile(claims: FirebaseAuthClaims): Promise<User> {
    const { firstName, lastName } = splitName(claims.name, claims.email);
    return this.usersRepository.upsert({
      id: claims.uid,
      email: claims.email ?? '',
      firstName,
      lastName,
    });
  }

  async list(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
