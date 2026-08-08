import { toLessonResponse } from '@dtos/lessons.dto';
import { LessonsService } from '@services/lessons.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class LessonsController {
  private readonly lessonsService: LessonsService;

  constructor() {
    this.lessonsService = container.resolve(LessonsService);
  }

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const lesson = await this.lessonsService.update(id, req.body);
    res.json({ data: toLessonResponse(lesson) });
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.lessonsService.delete(id);
    res.json({ data: result });
  });

  reorder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const lesson = await this.lessonsService.reorder(id, req.body);
    res.json({ data: toLessonResponse(lesson) });
  });
}
