import { subject } from '@casl/ability';
import { defineAbilityFor } from '@config/authorization';
import { describe, expect, it } from 'vitest';
import type { User } from '@/generated/prisma/client';

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

describe('defineAbilityFor', () => {
  it('grants ADMIN manage on everything', () => {
    const ability = defineAbilityFor(makeUser({ role: 'ADMIN' }));

    expect(ability.can('manage', 'all')).toBe(true);
    expect(ability.can('delete', 'Course')).toBe(true);
  });

  it('restricts STUDENT to its granted actions', () => {
    const ability = defineAbilityFor(makeUser({ role: 'STUDENT' }));

    expect(ability.can('read', 'Course')).toBe(true);
    expect(ability.can('create', 'Enrollment')).toBe(true);
    expect(ability.can('manage', 'all')).toBe(false);
    expect(ability.can('delete', 'Course')).toBe(false);
  });

  it('lets STUDENT read/update only its own User record', () => {
    const self = makeUser({ id: '018f5b3a-0000-7000-8000-000000000001' });
    const other = makeUser({ id: '018f5b3a-0000-7000-8000-000000000002' });
    const ability = defineAbilityFor(self);

    expect(ability.can('update', subject('User', self))).toBe(true);
    expect(ability.can('update', subject('User', other))).toBe(false);
  });
});
