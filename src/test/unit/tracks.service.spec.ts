import { HttpException } from '@exceptions/http.exception';
import type { TracksRepository } from '@repositories/tracks.repository';
import { TracksService } from '@services/tracks.service';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';

const uniqueConstraintError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.9.0',
    meta: { target: ['name'] },
  });

const makeRepo = (overrides: Partial<TracksRepository> = {}) =>
  ({
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as TracksRepository;

describe('TracksService.create', () => {
  it('slugifies the name when creating a track', async () => {
    const repo = makeRepo({
      create: vi.fn().mockResolvedValue({ id: '1', name: 'Web Dev', slug: 'web-dev' }),
    });
    const service = new TracksService(repo);

    await service.create('Web Dev');

    expect(repo.create).toHaveBeenCalledWith({ name: 'Web Dev', slug: 'web-dev' });
  });

  it('rejects duplicate track name with 409', async () => {
    const repo = makeRepo({ create: vi.fn().mockRejectedValue(uniqueConstraintError()) });
    const service = new TracksService(repo);

    await expect(service.create('Web Dev')).rejects.toMatchObject({
      status: 409,
      message: 'A track with this name already exists',
    } satisfies Partial<HttpException>);
  });
});

describe('TracksService.delete', () => {
  it('blocks deletion when the track has categories', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue({ id: '1', _count: { categories: 2 } }),
    });
    const service = new TracksService(repo);

    await expect(service.delete('1')).rejects.toMatchObject({
      status: 409,
      message: 'Delete all categories in this track first',
    } satisfies Partial<HttpException>);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('allows deletion when the track has no categories', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue({ id: '1', _count: { categories: 0 } }),
      delete: vi.fn().mockResolvedValue({ id: '1' }),
    });
    const service = new TracksService(repo);

    const result = await service.delete('1');

    expect(result).toEqual({ id: '1' });
    expect(repo.delete).toHaveBeenCalledWith('1');
  });

  it('throws 404 when the track does not exist', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = new TracksService(repo);

    await expect(service.delete('missing')).rejects.toMatchObject({ status: 404 });
  });
});
