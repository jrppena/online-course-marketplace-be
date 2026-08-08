import { listCoursesQuerySchema, toCourseDetail, toCourseListItem } from '@dtos/courses.dto';
import { toModuleResponse } from '@dtos/modules.dto';
import { CoursesService } from '@services/courses.service';
import { ModulesService } from '@services/modules.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class CoursesController {
  private readonly coursesService: CoursesService;
  private readonly modulesService: ModulesService;

  constructor() {
    this.coursesService = container.resolve(CoursesService);
    this.modulesService = container.resolve(ModulesService);
  }

  list: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, trackId, categoryId, status } = listCoursesQuerySchema.parse(
      req.query,
    );
    const { items, total } = await this.coursesService.list({
      page,
      limit,
      search,
      trackId,
      categoryId,
      status,
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.json({ data: items.map(toCourseListItem), meta: { page, total, totalPages, limit } });
  });

  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const course = await this.coursesService.getById(id);
    res.json({ data: toCourseDetail(course) });
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const course = await this.coursesService.create(req.body);
    res.json({ data: toCourseListItem(course) });
  });

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const course = await this.coursesService.update(id, req.body);
    res.json({ data: toCourseListItem(course) });
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.coursesService.delete(id);
    res.json({ data: result });
  });

  createModule: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const module = await this.modulesService.create(courseId, req.body);
    res.json({ data: toModuleResponse(module) });
  });
}
