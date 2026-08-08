import { LessonsController } from '@controllers/lessons.controller';
import { updateLessonSchema } from '@dtos/lessons.dto';
import { reorderSchema } from '@dtos/modules.dto';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class LessonsRoute implements Routes {
  public router: Router = Router();
  public path = '/lessons';
  private readonly lessonsController: LessonsController;

  constructor() {
    this.lessonsController = container.resolve(LessonsController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(updateLessonSchema),
      this.lessonsController.update,
    );
    this.router.delete(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      this.lessonsController.delete,
    );
    this.router.patch(
      '/:id/reorder',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(reorderSchema),
      this.lessonsController.reorder,
    );
  }
}
