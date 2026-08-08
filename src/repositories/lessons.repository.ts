import { prisma } from '@config/prisma';
import type { Lesson, LessonType } from '@/generated/prisma/client';

export interface NewLessonData {
  title: string;
  label: string;
  type: LessonType;
  meta: string;
  freePreview: boolean;
  rank: string;
}

export interface UpdateLessonData {
  title?: string;
  label?: string;
  type?: LessonType;
  meta?: string;
  freePreview?: boolean;
  rank?: string;
}

export class LessonsRepository {
  async findById(id: string) {
    return prisma.lesson.findUnique({ where: { id }, include: { module: true } });
  }

  async findLastInModule(moduleId: string) {
    return prisma.lesson.findFirst({ where: { moduleId }, orderBy: { rank: 'desc' } });
  }

  async findManyByModule(moduleId: string) {
    return prisma.lesson.findMany({ where: { moduleId }, orderBy: { rank: 'asc' } });
  }

  async create(moduleId: string, data: NewLessonData) {
    return prisma.lesson.create({ data: { ...data, moduleId } });
  }

  async update(id: string, data: UpdateLessonData) {
    return prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Lesson> {
    return prisma.lesson.delete({ where: { id } });
  }
}
