import { ModulesController } from '@controllers/modules.controller';
import { createLessonSchema } from '@dtos/lessons.dto';
import { reorderSchema, updateModuleSchema } from '@dtos/modules.dto';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class ModulesRoute implements Routes {
  public router: Router = Router();
  public path = '/modules';
  private readonly modulesController: ModulesController;

  constructor() {
    this.modulesController = container.resolve(ModulesController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(updateModuleSchema),
      this.modulesController.update,
    );
    this.router.delete(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      this.modulesController.delete,
    );
    this.router.patch(
      '/:id/reorder',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(reorderSchema),
      this.modulesController.reorder,
    );
    this.router.post(
      '/:moduleId/lessons',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(createLessonSchema),
      this.modulesController.createLesson,
    );
  }
}
