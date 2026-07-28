import { ForbiddenError } from '@casl/ability';
import type { Actions, Subjects } from '@config/authorization';
import { defineAbilityFor } from '@config/authorization';
import type { RequestWithAbility, RequestWithUser } from '@interfaces/auth.interface';
import { UsersService } from '@services/users.service';
import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

// Must run after AuthMiddleware. Resolves the app profile (role lives in the
// DB row, never the Firebase token) and attaches the ability + profile so
// authorize() and services downstream can enforce/query against them.
export const AbilityMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const { user: claims } = req as RequestWithUser;
  const usersService = container.resolve(UsersService);

  const profile = await usersService.getOrCreateProfile(claims);
  (req as RequestWithAbility).profile = profile;
  (req as RequestWithAbility).ability = defineAbilityFor(profile);

  next();
};

// Must run after AbilityMiddleware. Note: `authorize('read', 'User')` (a
// subject type, no instance) is true whenever any conditional `read User`
// rule exists — CASL can't evaluate `{ id }` without a record. Use 'manage'
// for admin-only routes; check record-level rules with the `subject()`
// helper inside services instead.
export const authorize = (action: Actions, subjectType: Subjects) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { ability } = req as RequestWithAbility;
    try {
      ForbiddenError.from(ability).throwUnlessCan(action, subjectType);
      next();
    } catch (err) {
      next(err);
    }
  };
};
