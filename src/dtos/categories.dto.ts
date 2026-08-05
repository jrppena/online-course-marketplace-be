import { z } from 'zod';
import type { Category } from '@/generated/prisma/client';

export interface CategoryResponse {
  id: string;
  createdAt: number;
  trackId: string;
  name: string;
  slug: string;
  visible: boolean;
  courseCount: number;
}

type CategoryWithCourseCount = Category & { _count: { courses: number } };

export const toCategoryResponse = (category: CategoryWithCourseCount): CategoryResponse => ({
  id: category.id,
  createdAt: category.createdAt.getTime(),
  trackId: category.trackId,
  name: category.name,
  slug: category.slug,
  visible: category.visible,
  courseCount: category._count.courses,
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  visible: z.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  visible: z.boolean().optional(),
});
