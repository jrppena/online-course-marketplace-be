import { HttpException } from '@exceptions/http.exception';
import { CoursesRepository } from '@repositories/courses.repository';
import { ModulesRepository, type UpdateModuleData } from '@repositories/modules.repository';
import { rankBetween } from '@utils/lexorank';
import { container } from 'tsyringe';

export interface CreateModuleInput {
  title: string;
  summary: string;
}

export type UpdateModuleInput = Partial<CreateModuleInput>;

export interface ReorderInput {
  beforeId?: string;
  afterId?: string;
}

export class ModulesService {
  private readonly modulesRepository: ModulesRepository;
  private readonly coursesRepository: CoursesRepository;

  constructor(modulesRepository?: ModulesRepository, coursesRepository?: CoursesRepository) {
    this.modulesRepository = modulesRepository ?? container.resolve(ModulesRepository);
    this.coursesRepository = coursesRepository ?? container.resolve(CoursesRepository);
  }

  async create(courseId: string, input: CreateModuleInput) {
    const courseExists = await this.coursesRepository.exists(courseId);
    if (!courseExists) throw new HttpException(404, 'Course not found');

    const lastModule = await this.modulesRepository.findLastInCourse(courseId);
    const rank = rankBetween(lastModule?.rank, undefined);

    return this.modulesRepository.create(courseId, { ...input, rank });
  }

  async update(id: string, input: UpdateModuleInput) {
    const module = await this.modulesRepository.findById(id);
    if (!module) throw new HttpException(404, 'Module not found');

    return this.modulesRepository.update(id, input);
  }

  async delete(id: string): Promise<{ id: string }> {
    const module = await this.modulesRepository.findById(id);
    if (!module) throw new HttpException(404, 'Module not found');

    await this.modulesRepository.delete(id);
    return { id };
  }

  async reorder(id: string, { beforeId, afterId }: ReorderInput) {
    const module = await this.modulesRepository.findById(id);
    if (!module) throw new HttpException(404, 'Module not found');

    const beforeModule = beforeId ? await this.modulesRepository.findById(beforeId) : undefined;
    if (beforeId && !beforeModule) throw new HttpException(404, 'beforeId not found');
    if (beforeModule && beforeModule.courseId !== module.courseId) {
      throw new HttpException(400, 'beforeId/afterId must belong to the same course');
    }

    const afterModule = afterId ? await this.modulesRepository.findById(afterId) : undefined;
    if (afterId && !afterModule) throw new HttpException(404, 'afterId not found');
    if (afterModule && afterModule.courseId !== module.courseId) {
      throw new HttpException(400, 'beforeId/afterId must belong to the same course');
    }

    const rank = rankBetween(beforeModule?.rank, afterModule?.rank);
    const data: UpdateModuleData = { rank };

    return this.modulesRepository.update(id, data);
  }
}
