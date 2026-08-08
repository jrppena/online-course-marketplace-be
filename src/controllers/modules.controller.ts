import { toLessonResponse } from '@dtos/lessons.dto';
import { toModuleResponse } from '@dtos/modules.dto';
import { LessonsService } from '@services/lessons.service';
import { ModulesService } from '@services/modules.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class ModulesController {
  private readonly modulesService: ModulesService;
  private readonly lessonsService: LessonsService;

  constructor() {
    this.modulesService = container.resolve(ModulesService);
    this.lessonsService = container.resolve(LessonsService);
  }

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const module = await this.modulesService.update(id, req.body);
    res.json({ data: toModuleResponse(module) });
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.modulesService.delete(id);
    res.json({ data: result });
  });

  reorder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const module = await this.modulesService.reorder(id, req.body);
    res.json({ data: toModuleResponse(module) });
  });

  createLesson: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { moduleId } = req.params as { moduleId: string };
    const lesson = await this.lessonsService.create(moduleId, req.body);
    res.json({ data: toLessonResponse(lesson) });
  });
}
