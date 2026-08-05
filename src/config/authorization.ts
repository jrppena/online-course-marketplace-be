import type { CreateAbility, ForcedSubject, MongoAbility, RawRuleOf } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { User } from '@/generated/prisma/client';

export const actions = ['manage', 'create', 'read', 'update', 'delete'] as const;
export const subjects = [
  'Course',
  'Lesson',
  'Enrollment',
  'Review',
  'User',
  'Track',
  'Category',
  'all',
] as const;

export type Actions = (typeof actions)[number];

// Tagged with the `id` field so CASL can type conditions like `{ id: user.id }`
// on 'User' (a bare string subject carries no fields to check conditions against).
// The `subject()` helper produces this same shape for record-level checks in services.
type UserSubject = Pick<User, 'id'> & ForcedSubject<'User'>;

export type Subjects = Exclude<(typeof subjects)[number], 'User'> | 'User' | UserSubject;

export type AppAbility = MongoAbility<[Actions, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

// Source of truth for CASL rules — mirrored (never redefined) on the FE, which
// builds its ability from the packed `rules` this backend ships in `GET /users/me`.
// STUDENT rules are intentionally granular (rather than one role check) so a future
// role (e.g. an instructor) can be added here without touching call sites.
export const defineRulesFor = (user: User): RawRuleOf<AppAbility>[] => {
  const { can, rules } = new AbilityBuilder<AppAbility>(createAppAbility);

  if (user.role === 'ADMIN') {
    can('manage', 'all');
  } else {
    can('read', ['Course', 'Lesson', 'Review']);
    can('create', ['Enrollment', 'Review']);
    can(['read', 'update'], 'User', { id: user.id });
  }

  return rules;
};

export const defineAbilityFor = (user: User): AppAbility => createAppAbility(defineRulesFor(user));
