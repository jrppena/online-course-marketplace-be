import { HttpException } from '@exceptions/http.exception';
import type { CategoriesRepository } from '@repositories/categories.repository';
import type { CoursesRepository } from '@repositories/courses.repository';
import { CoursesService } from '@services/courses.service';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';

const uniqueConstraintError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.9.0',
    meta: { target: ['slug'] },
  });

const makeCoursesRepo = (overrides: Partial<CoursesRepository> = {}) =>
  ({
    findAndCount: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as CoursesRepository;

const makeCategoriesRepo = (overrides: Partial<CategoriesRepository> = {}) =>
  ({
    findByTrackId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as CategoriesRepository;

const input = {
  title: 'Intro to TS',
  slug: 'intro-to-ts',
  subtitle: '',
  description: '',
  categoryId: 'category-1',
  price: 0,
  status: 'draft' as const,
  includes: [],
};

describe('CoursesService.create', () => {
  it('404s when the category does not exist', async () => {
    const coursesRepo = makeCoursesRepo();
    const categoriesRepo = makeCategoriesRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = new CoursesService(coursesRepo, categoriesRepo);

    await expect(service.create(input)).rejects.toMatchObject({
      status: 404,
      message: 'Category not found',
    } satisfies Partial<HttpException>);
    expect(coursesRepo.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate slug with 409', async () => {
    const coursesRepo = makeCoursesRepo({
      create: vi.fn().mockRejectedValue(uniqueConstraintError()),
    });
    const categoriesRepo = makeCategoriesRepo({
      findById: vi.fn().mockResolvedValue({ id: 'category-1' }),
    });
    const service = new CoursesService(coursesRepo, categoriesRepo);

    await expect(service.create(input)).rejects.toMatchObject({
      status: 409,
      message: 'A course with this slug already exists',
    } satisfies Partial<HttpException>);
  });

  it('creates the course with the uppercase status enum', async () => {
    const coursesRepo = makeCoursesRepo({
      create: vi.fn().mockResolvedValue({ id: 'course-1' }),
    });
    const categoriesRepo = makeCategoriesRepo({
      findById: vi.fn().mockResolvedValue({ id: 'category-1' }),
    });
    const service = new CoursesService(coursesRepo, categoriesRepo);

    await service.create(input);

    expect(coursesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'DRAFT', categoryId: 'category-1' }),
    );
  });
});

describe('CoursesService.list', () => {
  it('forwards params to the repository and returns {items,total}', async () => {
    const coursesRepo = makeCoursesRepo({
      findAndCount: vi.fn().mockResolvedValue({ items: [{ id: 'course-1' }], total: 1 }),
    });
    const service = new CoursesService(coursesRepo, makeCategoriesRepo());

    const result = await service.list({ page: 2, limit: 20, search: 'react' });

    expect(coursesRepo.findAndCount).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      search: 'react',
      status: undefined,
    });
    expect(result).toEqual({ items: [{ id: 'course-1' }], total: 1 });
  });

  it('converts api status to the Prisma enum and forwards trackId/categoryId', async () => {
    const coursesRepo = makeCoursesRepo({
      findAndCount: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    });
    const service = new CoursesService(coursesRepo, makeCategoriesRepo());

    await service.list({
      page: 1,
      limit: 10,
      trackId: 'track-1',
      categoryId: 'category-1',
      status: 'published',
    });

    expect(coursesRepo.findAndCount).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      trackId: 'track-1',
      categoryId: 'category-1',
      status: 'PUBLISHED',
    });
  });
});

describe('CoursesService.getById', () => {
  it('throws 404 when the course does not exist', async () => {
    const coursesRepo = makeCoursesRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = new CoursesService(coursesRepo, makeCategoriesRepo());

    await expect(service.getById('missing')).rejects.toMatchObject({ status: 404 });
  });
});
