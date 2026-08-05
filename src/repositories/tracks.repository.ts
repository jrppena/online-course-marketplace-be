import { prisma } from '@config/prisma';
import type { Track } from '@/generated/prisma/client';

export interface NewTrackData {
  name: string;
  slug: string;
}

export interface UpdateTrackData {
  name: string;
  slug: string;
}

const withCategoryCount = { include: { _count: { select: { categories: true } } } } as const;

export class TracksRepository {
  async findAll() {
    return prisma.track.findMany(withCategoryCount);
  }

  async findById(id: string) {
    return prisma.track.findUnique({ where: { id }, ...withCategoryCount });
  }

  async create(data: NewTrackData) {
    return prisma.track.create({ data, ...withCategoryCount });
  }

  async update(id: string, data: UpdateTrackData) {
    return prisma.track.update({ where: { id }, data, ...withCategoryCount });
  }

  async delete(id: string): Promise<Track> {
    return prisma.track.delete({ where: { id } });
  }
}
