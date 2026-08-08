import { lessonTypeToApi } from '@dtos/courses.dto';
import { z } from 'zod';
import type { Lesson } from '@/generated/prisma/client';

export interface LessonResponse {
  id: string;
  moduleId: string;
  label: string;
  title: string;
  type: 'video' | 'reading';
  meta: string;
  freePreview: boolean;
  rank: string;
}

export const toLessonResponse = (lesson: Lesson): LessonResponse => ({
  id: lesson.id,
  moduleId: lesson.moduleId,
  label: lesson.label,
  title: lesson.title,
  type: lessonTypeToApi[lesson.type],
  meta: lesson.meta,
  freePreview: lesson.freePreview,
  rank: lesson.rank,
});

export const createLessonSchema = z.object({
  title: z.string().min(1),
  label: z.string().optional().default(''),
  type: z.enum(['video', 'reading']),
  meta: z.string().optional().default(''),
  freePreview: z.boolean().optional().default(false),
});

export const updateLessonSchema = createLessonSchema.partial();
