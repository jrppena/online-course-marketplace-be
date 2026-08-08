import { CoursesRepository } from '@repositories/courses.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@config/prisma', () => ({
  prisma: {
    course: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '@config/prisma';

describe('CoursesRepository.findAndCount', () => {
  beforeEach(() => {
    vi.mocked(prisma.$transaction).mockReset();
  });

  it('builds a case-insensitive OR on title+subtitle when search is provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({ page: 1, limit: 10, search: 'react' });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: 'react', mode: 'insensitive' } },
                { subtitle: { contains: 'react', mode: 'insensitive' } },
              ],
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('omits where when search is absent and paginates by page/limit', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({ page: 3, limit: 20 });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
        skip: 40,
        take: 20,
      }),
    );
    expect(prisma.course.count).toHaveBeenCalledWith({ where: undefined });
  });

  it('returns {items,total} from the transaction result', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[{ id: 'course-1' }], 5]);
    const repo = new CoursesRepository();

    const result = await repo.findAndCount({ page: 1, limit: 10 });

    expect(result).toEqual({ items: [{ id: 'course-1' }], total: 5 });
  });

  it('filters by categoryId equality', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({ page: 1, limit: 10, categoryId: 'category-1' });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ categoryId: 'category-1' }] },
      }),
    );
  });

  it('filters by trackId via the category relation', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({ page: 1, limit: 10, trackId: 'track-1' });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ category: { trackId: 'track-1' } }] },
      }),
    );
  });

  it('filters by status', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({ page: 1, limit: 10, status: 'PUBLISHED' });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ status: 'PUBLISHED' }] },
      }),
    );
  });

  it('combines search, trackId, categoryId, and status with AND semantics', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);
    const repo = new CoursesRepository();

    await repo.findAndCount({
      page: 1,
      limit: 10,
      search: 'react',
      trackId: 'track-1',
      categoryId: 'category-1',
      status: 'DRAFT',
    });

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: 'react', mode: 'insensitive' } },
                { subtitle: { contains: 'react', mode: 'insensitive' } },
              ],
            },
            { categoryId: 'category-1' },
            { category: { trackId: 'track-1' } },
            { status: 'DRAFT' },
          ],
        },
      }),
    );
  });
});
