import { CoursesController } from '@controllers/courses.controller';
import { createCourseSchema, updateCourseSchema } from '@dtos/courses.dto';
import { createModuleSchema } from '@dtos/modules.dto';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class CoursesRoute implements Routes {
  public router: Router = Router();
  public path = '/courses';
  private readonly coursesController: CoursesController;

  constructor() {
    this.coursesController = container.resolve(CoursesController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      this.coursesController.list,
    );
    this.router.post(
      '/',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(createCourseSchema),
      this.coursesController.create,
    );
    this.router.get(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      this.coursesController.getById,
    );
    this.router.patch(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(updateCourseSchema),
      this.coursesController.update,
    );
    this.router.delete(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      this.coursesController.delete,
    );
    this.router.post(
      '/:courseId/modules',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Course'),
      ValidationMiddleware(createModuleSchema),
      this.coursesController.createModule,
    );
  }
}
