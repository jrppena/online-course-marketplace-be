import { toCategoryResponse } from '@dtos/categories.dto';
import { toTrackResponse } from '@dtos/tracks.dto';
import { CategoriesService } from '@services/categories.service';
import { TracksService } from '@services/tracks.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class TracksController {
  private readonly tracksService: TracksService;
  private readonly categoriesService: CategoriesService;

  constructor() {
    this.tracksService = container.resolve(TracksService);
    this.categoriesService = container.resolve(CategoriesService);
  }

  list: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
    const tracks = await this.tracksService.list();
    res.json({ data: tracks.map(toTrackResponse) });
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };
    const track = await this.tracksService.create(name);
    res.json({ data: toTrackResponse(track) });
  });

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };
    const { id } = req.params as { id: string };
    const track = await this.tracksService.update(id, name);
    res.json({ data: toTrackResponse(track) });
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.tracksService.delete(id);
    res.json({ data: result });
  });

  listCategories: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { trackId } = req.params as { trackId: string };
    const categories = await this.categoriesService.listByTrack(trackId);
    res.json({ data: categories.map(toCategoryResponse) });
  });

  createCategory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, visible } = req.body as { name: string; slug: string; visible: boolean };
    const { trackId } = req.params as { trackId: string };
    const category = await this.categoriesService.create(trackId, name, slug, visible);
    res.json({ data: toCategoryResponse(category) });
  });
}
