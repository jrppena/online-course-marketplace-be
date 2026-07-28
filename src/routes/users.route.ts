import { UsersController } from '@controllers/users.controller';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class UsersRoute implements Routes {
  public router: Router = Router();
  public path = '/users';
  private readonly usersController: UsersController;

  constructor() {
    this.usersController = container.resolve(UsersController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/me', AuthMiddleware, AbilityMiddleware, this.usersController.getMe);
    this.router.get(
      '/',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'User'),
      this.usersController.list,
    );
  }
}
