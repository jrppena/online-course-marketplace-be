import { courseStatusFromApi, type ListCoursesQuery } from '@dtos/courses.dto';
import { HttpException } from '@exceptions/http.exception';
import { CategoriesRepository } from '@repositories/categories.repository';
import {
  CoursesRepository,
  type NewCourseData,
  type UpdateCourseData,
} from '@repositories/courses.repository';
import { container } from 'tsyringe';
import { Prisma } from '@/generated/prisma/client';

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';

export interface CreateCourseInput {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  categoryId: string;
  price: number;
  status: 'draft' | 'published';
  includes: string[];
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export class CoursesService {
  private readonly coursesRepository: CoursesRepository;
  private readonly categoriesRepository: CategoriesRepository;

  constructor(coursesRepository?: CoursesRepository, categoriesRepository?: CategoriesRepository) {
    this.coursesRepository = coursesRepository ?? container.resolve(CoursesRepository);
    this.categoriesRepository = categoriesRepository ?? container.resolve(CategoriesRepository);
  }

  async list(params: ListCoursesQuery) {
    return this.coursesRepository.findAndCount({
      ...params,
      status: params.status ? courseStatusFromApi[params.status] : undefined,
    });
  }

  async getById(id: string) {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new HttpException(404, 'Course not found');
    return course;
  }

  async create(input: CreateCourseInput) {
    const category = await this.categoriesRepository.findById(input.categoryId);
    if (!category) throw new HttpException(404, 'Category not found');

    const data: NewCourseData = {
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle,
      description: input.description,
      categoryId: input.categoryId,
      price: input.price,
      status: courseStatusFromApi[input.status],
      includes: input.includes,
    };

    try {
      return await this.coursesRepository.create(data);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A course with this slug already exists');
      }
      throw err;
    }
  }

  async update(id: string, input: UpdateCourseInput) {
    const courseExists = await this.coursesRepository.exists(id);
    if (!courseExists) throw new HttpException(404, 'Course not found');

    if (input.categoryId) {
      const category = await this.categoriesRepository.findById(input.categoryId);
      if (!category) throw new HttpException(404, 'Category not found');
    }

    const data: UpdateCourseData = {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.status !== undefined && { status: courseStatusFromApi[input.status] }),
      ...(input.includes !== undefined && { includes: input.includes }),
    };

    try {
      return await this.coursesRepository.update(id, data);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new HttpException(409, 'A course with this slug already exists');
      }
      throw err;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    const courseExists = await this.coursesRepository.exists(id);
    if (!courseExists) throw new HttpException(404, 'Course not found');

    await this.coursesRepository.delete(id);
    return { id };
  }
}
