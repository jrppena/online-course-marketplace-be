import { prisma } from '@config/prisma';
import type { Module } from '@/generated/prisma/client';

export interface NewModuleData {
  title: string;
  summary: string;
  rank: string;
}

export interface UpdateModuleData {
  title?: string;
  summary?: string;
  rank?: string;
}

export class ModulesRepository {
  async findById(id: string) {
    return prisma.module.findUnique({ where: { id }, include: { course: true } });
  }

  async findLastInCourse(courseId: string) {
    return prisma.module.findFirst({ where: { courseId }, orderBy: { rank: 'desc' } });
  }

  async findManyByCourse(courseId: string) {
    return prisma.module.findMany({ where: { courseId }, orderBy: { rank: 'asc' } });
  }

  async create(courseId: string, data: NewModuleData) {
    return prisma.module.create({ data: { ...data, courseId } });
  }

  async update(id: string, data: UpdateModuleData) {
    return prisma.module.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Module> {
    return prisma.module.delete({ where: { id } });
  }
}
