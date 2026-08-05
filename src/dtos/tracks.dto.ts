import { z } from 'zod';
import type { Track } from '@/generated/prisma/client';

export interface TrackResponse {
  id: string;
  createdAt: number;
  name: string;
  slug: string;
  categoryCount: number;
}

type TrackWithCategoryCount = Track & { _count: { categories: number } };

export const toTrackResponse = (track: TrackWithCategoryCount): TrackResponse => ({
  id: track.id,
  createdAt: track.createdAt.getTime(),
  name: track.name,
  slug: track.slug,
  categoryCount: track._count.categories,
});

export const createTrackSchema = z.object({
  name: z.string().min(1),
});

export const updateTrackSchema = z.object({
  name: z.string().min(1),
});
