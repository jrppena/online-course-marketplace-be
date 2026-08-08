import { prisma } from '@config/prisma';
import type { Course, CourseStatus, Prisma } from '@/generated/prisma/client';

export interface NewCourseData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  categoryId: string;
  price: number;
  status: CourseStatus;
  includes: string[];
}

export interface UpdateCourseData {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  status?: CourseStatus;
  includes?: string[];
}

export interface FindAndCountParams {
  page: number;
  limit: number;
  search?: string;
  trackId?: string;
  categoryId?: string;
  status?: CourseStatus;
}

const withCategoryTrack = { include: { category: { include: { track: true } } } } as const;

const withCategoryTrackAndModules = {
  include: {
    category: { include: { track: true } },
    modules: {
      orderBy: { rank: 'asc' as const },
      include: { lessons: { orderBy: { rank: 'asc' as const } } },
    },
  },
} as const;

export class CoursesRepository {
  async findAndCount({ page, limit, search, trackId, categoryId, status }: FindAndCountParams) {
    const conditions: Prisma.CourseWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (categoryId) {
      conditions.push({ categoryId });
    }

    if (trackId) {
      conditions.push({ category: { trackId } });
    }

    if (status) {
      conditions.push({ status });
    }

    const where: Prisma.CourseWhereInput | undefined = conditions.length
      ? { AND: conditions }
      : undefined;

    const [items, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        ...withCategoryTrack,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.course.findUnique({ where: { id }, ...withCategoryTrackAndModules });
  }

  async exists(id: string): Promise<boolean> {
    const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
    return course !== null;
  }

  async create(data: NewCourseData) {
    return prisma.course.create({ data, ...withCategoryTrack });
  }

  async update(id: string, data: UpdateCourseData) {
    return prisma.course.update({ where: { id }, data, ...withCategoryTrack });
  }

  async delete(id: string): Promise<Course> {
    return prisma.course.delete({ where: { id } });
  }
}
