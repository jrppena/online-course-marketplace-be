import { lessonTypeFromApi } from '@dtos/courses.dto';
import { HttpException } from '@exceptions/http.exception';
import { LessonsRepository, type UpdateLessonData } from '@repositories/lessons.repository';
import { ModulesRepository } from '@repositories/modules.repository';
import { rankBetween } from '@utils/lexorank';
import { container } from 'tsyringe';

export interface CreateLessonInput {
  title: string;
  label: string;
  type: 'video' | 'reading';
  meta: string;
  freePreview: boolean;
}

export type UpdateLessonInput = Partial<CreateLessonInput>;

export interface ReorderInput {
  beforeId?: string;
  afterId?: string;
}

export class LessonsService {
  private readonly lessonsRepository: LessonsRepository;
  private readonly modulesRepository: ModulesRepository;

  constructor(lessonsRepository?: LessonsRepository, modulesRepository?: ModulesRepository) {
    this.lessonsRepository = lessonsRepository ?? container.resolve(LessonsRepository);
    this.modulesRepository = modulesRepository ?? container.resolve(ModulesRepository);
  }

  async create(moduleId: string, input: CreateLessonInput) {
    const module = await this.modulesRepository.findById(moduleId);
    if (!module) throw new HttpException(404, 'Module not found');

    const lastLesson = await this.lessonsRepository.findLastInModule(moduleId);
    const rank = rankBetween(lastLesson?.rank, undefined);

    return this.lessonsRepository.create(moduleId, {
      title: input.title,
      label: input.label,
      type: lessonTypeFromApi[input.type],
      meta: input.meta,
      freePreview: input.freePreview,
      rank,
    });
  }

  async update(id: string, input: UpdateLessonInput) {
    const lesson = await this.lessonsRepository.findById(id);
    if (!lesson) throw new HttpException(404, 'Lesson not found');

    const data: UpdateLessonData = {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.type !== undefined && { type: lessonTypeFromApi[input.type] }),
      ...(input.meta !== undefined && { meta: input.meta }),
      ...(input.freePreview !== undefined && { freePreview: input.freePreview }),
    };

    return this.lessonsRepository.update(id, data);
  }

  async delete(id: string): Promise<{ id: string }> {
    const lesson = await this.lessonsRepository.findById(id);
    if (!lesson) throw new HttpException(404, 'Lesson not found');

    await this.lessonsRepository.delete(id);
    return { id };
  }

  async reorder(id: string, { beforeId, afterId }: ReorderInput) {
    const lesson = await this.lessonsRepository.findById(id);
    if (!lesson) throw new HttpException(404, 'Lesson not found');

    const beforeLesson = beforeId ? await this.lessonsRepository.findById(beforeId) : undefined;
    if (beforeId && !beforeLesson) throw new HttpException(404, 'beforeId not found');
    if (beforeLesson && beforeLesson.moduleId !== lesson.moduleId) {
      throw new HttpException(400, 'beforeId/afterId must belong to the same module');
    }

    const afterLesson = afterId ? await this.lessonsRepository.findById(afterId) : undefined;
    if (afterId && !afterLesson) throw new HttpException(404, 'afterId not found');
    if (afterLesson && afterLesson.moduleId !== lesson.moduleId) {
      throw new HttpException(400, 'beforeId/afterId must belong to the same module');
    }

    const rank = rankBetween(beforeLesson?.rank, afterLesson?.rank);
    const data: UpdateLessonData = { rank };

    return this.lessonsRepository.update(id, data);
  }
}
