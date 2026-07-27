import type { UsersRepository } from '@repositories/users.repository';
import { UsersService } from '@services/users.service';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '@/generated/prisma/client';

const makeRepo = (existing: User | null = null) =>
  ({
    findById: vi.fn().mockResolvedValue(existing),
    create: vi.fn().mockImplementation(async (data) => ({
      ...data,
      role: 'USER',
      bio: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  }) as unknown as UsersRepository;

describe('UsersService.getOrCreateProfile', () => {
  it('returns the existing profile without creating one', async () => {
    const existing = {
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      role: 'USER',
      bio: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    const repo = makeRepo(existing);
    const service = new UsersService(repo);

    const result = await service.getOrCreateProfile({ uid: 'uid-1', email: 'a@b.com' });

    expect(result).toBe(existing);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('splits displayName into firstName/lastName on first sign-in', async () => {
    const repo = makeRepo(null);
    const service = new UsersService(repo);

    await service.getOrCreateProfile({ uid: 'uid-2', email: 'jane@doe.com', name: 'Jane Doe' });

    expect(repo.create).toHaveBeenCalledWith({
      id: 'uid-2',
      email: 'jane@doe.com',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('falls back to email, then "New User", when no display name is set', async () => {
    const repo = makeRepo(null);
    const service = new UsersService(repo);

    await service.getOrCreateProfile({ uid: 'uid-3', email: 'solo@example.com' });
    expect(repo.create).toHaveBeenCalledWith({
      id: 'uid-3',
      email: 'solo@example.com',
      firstName: 'solo@example.com',
      lastName: 'User',
    });

    await service.getOrCreateProfile({ uid: 'uid-4' });
    expect(repo.create).toHaveBeenCalledWith({
      id: 'uid-4',
      email: '',
      firstName: 'New',
      lastName: 'User',
    });
  });
});
