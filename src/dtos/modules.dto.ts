import { z } from 'zod';
import type { Module } from '@/generated/prisma/client';

export interface ModuleResponse {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  rank: string;
}

export const toModuleResponse = (module: Module): ModuleResponse => ({
  id: module.id,
  courseId: module.courseId,
  title: module.title,
  summary: module.summary,
  rank: module.rank,
});

export const createModuleSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional().default(''),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderSchema = z
  .object({
    beforeId: z.string().uuid().optional(),
    afterId: z.string().uuid().optional(),
  })
  .refine((data) => data.beforeId || data.afterId, {
    message: 'beforeId or afterId required',
  });
