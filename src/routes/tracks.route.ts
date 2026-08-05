import { TracksController } from '@controllers/tracks.controller';
import { createCategorySchema } from '@dtos/categories.dto';
import { createTrackSchema, updateTrackSchema } from '@dtos/tracks.dto';
import type { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AbilityMiddleware, authorize } from '@middlewares/authorization.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { Router } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class TracksRoute implements Routes {
  public router: Router = Router();
  public path = '/tracks';
  private readonly tracksController: TracksController;

  constructor() {
    this.tracksController = container.resolve(TracksController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Track'),
      this.tracksController.list,
    );
    this.router.post(
      '/',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Track'),
      ValidationMiddleware(createTrackSchema),
      this.tracksController.create,
    );
    this.router.patch(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Track'),
      ValidationMiddleware(updateTrackSchema),
      this.tracksController.update,
    );
    this.router.delete(
      '/:id',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Track'),
      this.tracksController.delete,
    );
    this.router.get(
      '/:trackId/categories',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Category'),
      this.tracksController.listCategories,
    );
    this.router.post(
      '/:trackId/categories',
      AuthMiddleware,
      AbilityMiddleware,
      authorize('manage', 'Category'),
      ValidationMiddleware(createCategorySchema),
      this.tracksController.createCategory,
    );
  }
}
