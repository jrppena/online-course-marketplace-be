import { CategoriesController } from '@controllers/categories.controller';
import { updateCategorySchema } from '@dtos/categories.dto';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class CategoriesRoute implements Routes {
  public router: Router = Router();
  public path = '/categories';
  private readonly categoriesController: CategoriesController;

  constructor() {
    this.categoriesController = container.resolve(CategoriesController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Category'),
      ValidationMiddleware(updateCategorySchema),
      this.categoriesController.update,
    );
    this.router.delete(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Category'),
      this.categoriesController.delete,
    );
  }
}
