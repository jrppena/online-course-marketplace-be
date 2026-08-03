import { defineAbilityFor } from '@config/authorization';
import type { RequestWithAbility } from '@interfaces/auth.interface';
import { UsersService } from '@services/users.service';
import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/generated/prisma/client';

const { AbilityMiddleware, authorize } = await import('@middlewares/authorization.middleware');

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: '018f5b3a-0000-7000-8000-000000000001',
    firebaseUid: 'uid-1',
    email: 'a@b.com',
    firstName: 'A',
    lastName: 'B',
    role: 'STUDENT',
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as User;

describe('AbilityMiddleware', () => {
  beforeEach(() => {
    container.reset();
  });

  it('attaches profile and ability to the request', async () => {
    const profile = makeUser();
    const getOrCreateProfile = vi.fn().mockResolvedValue(profile);
    container.registerInstance(UsersService, { getOrCreateProfile } as unknown as UsersService);

    const req = { user: { uid: 'uid-1' } } as unknown as Request;
    const next = vi.fn() as unknown as NextFunction;

    await AbilityMiddleware(req, {} as Response, next);

    expect(getOrCreateProfile).toHaveBeenCalledWith({ uid: 'uid-1' });
    expect((req as unknown as RequestWithAbility).profile).toBe(profile);
    expect((req as unknown as RequestWithAbility).ability.can('read', 'Course')).toBe(true);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('authorize', () => {
  it('calls next() when the ability permits the action', () => {
    const req = { ability: defineAbilityFor(makeUser({ role: 'ADMIN' })) } as unknown as Request;
    const next = vi.fn() as unknown as NextFunction;

    authorize('manage', 'User')(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(err) when the ability forbids the action', () => {
    const req = { ability: defineAbilityFor(makeUser({ role: 'STUDENT' })) } as unknown as Request;
    const next = vi.fn() as unknown as NextFunction;

    authorize('manage', 'User')(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ForbiddenError' }));
  });
});
