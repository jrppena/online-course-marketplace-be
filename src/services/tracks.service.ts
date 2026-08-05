import { HttpException } from '@exceptions/http.exception';
import { TracksRepository } from '@repositories/tracks.repository';
import { slugify } from '@utils/slugify';
import { container } from 'tsyringe';
import { Prisma } from '@/generated/prisma/client';

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';

export class TracksService {
  private readonly tracksRepository: TracksRepository;

  constructor(tracksRepository?: TracksRepository) {
    this.tracksRepository = tracksRepository ?? container.resolve(TracksRepository);
  }

  async list() {
    return this.tracksRepository.findAll();
  }

  async create(name: string) {
    try {
      return await this.tracksRepository.create({ name, slug: slugify(name) });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A track with this name already exists');
      }
      throw err;
    }
  }

  async update(id: string, name: string) {
    try {
      return await this.tracksRepository.update(id, { name, slug: slugify(name) });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A track with this name already exists');
      }
      throw err;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    const track = await this.tracksRepository.findById(id);
    if (!track) throw new HttpException(404, 'Track not found');
    if (track._count.categories > 0) {
      throw new HttpException(409, 'Delete all categories in this track first');
    }

    await this.tracksRepository.delete(id);
    return { id };
  }
}
