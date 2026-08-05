import { toCategoryResponse } from '@dtos/categories.dto';
import { CategoriesService } from '@services/categories.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class CategoriesController {
  private readonly categoriesService: CategoriesService;

  constructor() {
    this.categoriesService = container.resolve(CategoriesService);
  }

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const category = await this.categoriesService.update(id, req.body);
    res.json({ data: toCategoryResponse(category) });
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.categoriesService.delete(id);
    res.json({ data: result });
  });
}
