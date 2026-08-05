import { HttpException } from '@exceptions/http.exception';
import { CategoriesRepository } from '@repositories/categories.repository';
import { TracksRepository } from '@repositories/tracks.repository';
import { container } from 'tsyringe';
import { Prisma } from '@/generated/prisma/client';

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  visible?: boolean;
}

export class CategoriesService {
  private readonly categoriesRepository: CategoriesRepository;
  private readonly tracksRepository: TracksRepository;

  constructor(categoriesRepository?: CategoriesRepository, tracksRepository?: TracksRepository) {
    this.categoriesRepository = categoriesRepository ?? container.resolve(CategoriesRepository);
    this.tracksRepository = tracksRepository ?? container.resolve(TracksRepository);
  }

  async listByTrack(trackId: string) {
    const track = await this.tracksRepository.findById(trackId);
    if (!track) throw new HttpException(404, 'Track not found');

    return this.categoriesRepository.findByTrackId(trackId);
  }

  async create(trackId: string, name: string, slug: string, visible: boolean) {
    const track = await this.tracksRepository.findById(trackId);
    if (!track) throw new HttpException(404, 'Track not found');

    try {
      return await this.categoriesRepository.create({ trackId, name, slug, visible });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A category with this slug already exists in this track');
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new HttpException(404, 'Category not found');

    try {
      return await this.categoriesRepository.update(id, data);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A category with this slug already exists in this track');
      }
      throw err;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new HttpException(404, 'Category not found');
    if (category._count.courses > 0) {
      throw new HttpException(409, 'Category has courses; cannot delete');
    }

    await this.categoriesRepository.delete(id);
    return { id };
  }
}
