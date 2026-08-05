import { prisma } from '@config/prisma';
import type { Category } from '@/generated/prisma/client';

export interface NewCategoryData {
  trackId: string;
  name: string;
  slug: string;
  visible: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  visible?: boolean;
}

const withCourseCount = { include: { _count: { select: { courses: true } } } } as const;

export class CategoriesRepository {
  async findByTrackId(trackId: string) {
    return prisma.category.findMany({ where: { trackId }, ...withCourseCount });
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id }, ...withCourseCount });
  }

  async create(data: NewCategoryData) {
    return prisma.category.create({ data, ...withCourseCount });
  }

  async update(id: string, data: UpdateCategoryData) {
    return prisma.category.update({ where: { id }, data, ...withCourseCount });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }
}
