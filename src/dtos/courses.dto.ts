import { z } from 'zod';
import type {
  Category,
  Course,
  CourseStatus,
  Lesson,
  LessonType,
  Module,
  Track,
} from '@/generated/prisma/client';

export const courseStatusToApi: Record<CourseStatus, 'draft' | 'published'> = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

export const courseStatusFromApi: Record<'draft' | 'published', CourseStatus> = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
};

export const lessonTypeToApi: Record<LessonType, 'video' | 'reading'> = {
  VIDEO: 'video',
  READING: 'reading',
};

export const lessonTypeFromApi: Record<'video' | 'reading', LessonType> = {
  video: 'VIDEO',
  reading: 'READING',
};

export interface CourseListItemResponse {
  id: string;
  createdAt: number;
  title: string;
  slug: string;
  price: number;
  status: 'draft' | 'published';
  track: { id: string; name: string };
  category: { id: string; name: string };
}

export interface CourseDetailResponse extends CourseListItemResponse {
  subtitle: string;
  description: string;
  includes: string[];
  category: { id: string; name: string; trackId: string };
  modules: {
    id: string;
    title: string;
    summary: string;
    rank: string;
    lessons: {
      id: string;
      label: string;
      title: string;
      type: 'video' | 'reading';
      meta: string;
      freePreview: boolean;
      rank: string;
    }[];
  }[];
}

type CategoryWithTrack = Category & { track: Track };
type CourseWithCategory = Course & { category: CategoryWithTrack };
type ModuleWithLessons = Module & { lessons: Lesson[] };
type CourseWithModules = CourseWithCategory & { modules: ModuleWithLessons[] };

export const toCourseListItem = (course: CourseWithCategory): CourseListItemResponse => ({
  id: course.id,
  createdAt: course.createdAt.getTime(),
  title: course.title,
  slug: course.slug,
  price: course.price,
  status: courseStatusToApi[course.status],
  track: { id: course.category.track.id, name: course.category.track.name },
  category: { id: course.category.id, name: course.category.name },
});

export const toCourseDetail = (course: CourseWithModules): CourseDetailResponse => ({
  ...toCourseListItem(course),
  subtitle: course.subtitle,
  description: course.description,
  includes: course.includes,
  category: {
    id: course.category.id,
    name: course.category.name,
    trackId: course.category.trackId,
  },
  modules: course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    summary: module.summary,
    rank: module.rank,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      label: lesson.label,
      title: lesson.title,
      type: lessonTypeToApi[lesson.type],
      meta: lesson.meta,
      freePreview: lesson.freePreview,
      rank: lesson.rank,
    })),
  })),
});

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  trackId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

export const createCourseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional().default(''),
  description: z.string().optional().default(''),
  categoryId: z.string().uuid(),
  price: z.number().int().min(0).optional().default(0),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  includes: z.array(z.string()).optional().default([]),
});

export const updateCourseSchema = createCourseSchema.partial();
