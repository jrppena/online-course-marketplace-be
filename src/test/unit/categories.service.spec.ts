import { HttpException } from '@exceptions/http.exception';
import type { CategoriesRepository } from '@repositories/categories.repository';
import type { TracksRepository } from '@repositories/tracks.repository';
import { CategoriesService } from '@services/categories.service';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';

const uniqueConstraintError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.9.0',
    meta: { target: ['trackId', 'slug'] },
  });

const makeCategoriesRepo = (overrides: Partial<CategoriesRepository> = {}) =>
  ({
    findByTrackId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as CategoriesRepository;

const makeTracksRepo = (overrides: Partial<TracksRepository> = {}) =>
  ({
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue({ id: 'track-1', _count: { categories: 1 } }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as TracksRepository;

describe('CategoriesService.create', () => {
  it('defaults visible to true when omitted upstream default already applied', async () => {
    const categoriesRepo = makeCategoriesRepo({
      create: vi.fn().mockResolvedValue({ id: '1', trackId: 'track-1' }),
    });
    const tracksRepo = makeTracksRepo();
    const service = new CategoriesService(categoriesRepo, tracksRepo);

    await service.create('track-1', 'Frontend', 'frontend', true);

    expect(categoriesRepo.create).toHaveBeenCalledWith({
      trackId: 'track-1',
      name: 'Frontend',
      slug: 'frontend',
      visible: true,
    });
  });

  it('throws 404 when the track does not exist', async () => {
    const categoriesRepo = makeCategoriesRepo();
    const tracksRepo = makeTracksRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = new CategoriesService(categoriesRepo, tracksRepo);

    await expect(service.create('missing', 'Frontend', 'frontend', true)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('rejects duplicate slug within the same track with 409', async () => {
    const categoriesRepo = makeCategoriesRepo({
      create: vi.fn().mockRejectedValue(uniqueConstraintError()),
    });
    const tracksRepo = makeTracksRepo();
    const service = new CategoriesService(categoriesRepo, tracksRepo);

    await expect(service.create('track-1', 'Frontend', 'frontend', true)).rejects.toMatchObject({
      status: 409,
      message: 'A category with this slug already exists in this track',
    } satisfies Partial<HttpException>);
  });
});

describe('CategoriesService.delete', () => {
  it('blocks deletion when the category has courses', async () => {
    const categoriesRepo = makeCategoriesRepo({
      findById: vi.fn().mockResolvedValue({ id: '1', _count: { courses: 3 } }),
    });
    const service = new CategoriesService(categoriesRepo, makeTracksRepo());

    await expect(service.delete('1')).rejects.toMatchObject({
      status: 409,
      message: 'Category has courses; cannot delete',
    } satisfies Partial<HttpException>);
    expect(categoriesRepo.delete).not.toHaveBeenCalled();
  });

  it('allows deletion when the category has no courses', async () => {
    const categoriesRepo = makeCategoriesRepo({
      findById: vi.fn().mockResolvedValue({ id: '1', _count: { courses: 0 } }),
      delete: vi.fn().mockResolvedValue({ id: '1' }),
    });
    const service = new CategoriesService(categoriesRepo, makeTracksRepo());

    const result = await service.delete('1');

    expect(result).toEqual({ id: '1' });
    expect(categoriesRepo.delete).toHaveBeenCalledWith('1');
  });

  it('throws 404 when the category does not exist', async () => {
    const categoriesRepo = makeCategoriesRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = new CategoriesService(categoriesRepo, makeTracksRepo());

    await expect(service.delete('missing')).rejects.toMatchObject({ status: 404 });
  });
});
