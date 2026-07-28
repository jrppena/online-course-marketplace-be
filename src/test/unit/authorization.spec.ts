import { subject } from '@casl/ability';
import { defineAbilityFor } from '@config/authorization';
import { describe, expect, it } from 'vitest';
import type { User } from '@/generated/prisma/client';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'uid-1',
    email: 'a@b.com',
    firstName: 'A',
    lastName: 'B',
    role: 'USER',
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as User;

describe('defineAbilityFor', () => {
  it('grants ADMIN manage on everything', () => {
    const ability = defineAbilityFor(makeUser({ role: 'ADMIN' }));

    expect(ability.can('manage', 'all')).toBe(true);
    expect(ability.can('delete', 'Course')).toBe(true);
  });

  it('restricts USER to its granted actions', () => {
    const ability = defineAbilityFor(makeUser({ role: 'USER' }));

    expect(ability.can('read', 'Course')).toBe(true);
    expect(ability.can('create', 'Enrollment')).toBe(true);
    expect(ability.can('manage', 'all')).toBe(false);
    expect(ability.can('delete', 'Course')).toBe(false);
  });

  it('lets USER read/update only its own User record', () => {
    const self = makeUser({ id: 'uid-1' });
    const other = makeUser({ id: 'uid-2' });
    const ability = defineAbilityFor(self);

    expect(ability.can('update', subject('User', self))).toBe(true);
    expect(ability.can('update', subject('User', other))).toBe(false);
  });
});
