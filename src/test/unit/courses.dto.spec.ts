import { listCoursesQuerySchema } from '@dtos/courses.dto';
import { describe, expect, it } from 'vitest';

describe('listCoursesQuerySchema', () => {
  it('applies defaults when query is empty', () => {
    expect(listCoursesQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
    });
  });

  it('coerces string page/limit to numbers', () => {
    const result = listCoursesQuerySchema.parse({ page: '3', limit: '25' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it('rejects limit greater than 100', () => {
    expect(() => listCoursesQuerySchema.parse({ limit: '101' })).toThrow();
  });

  it('turns empty-string search into undefined', () => {
    const result = listCoursesQuerySchema.parse({ search: '' });
    expect(result.search).toBeUndefined();
  });

  it('trims and keeps a non-empty search', () => {
    const result = listCoursesQuerySchema.parse({ search: '  react  ' });
    expect(result.search).toBe('react');
  });

  it('accepts a valid trackId uuid', () => {
    const trackId = '11111111-1111-1111-1111-111111111111';
    const result = listCoursesQuerySchema.parse({ trackId });
    expect(result.trackId).toBe(trackId);
  });

  it('rejects an invalid trackId uuid', () => {
    expect(() => listCoursesQuerySchema.parse({ trackId: 'not-a-uuid' })).toThrow();
  });

  it('accepts a valid categoryId uuid', () => {
    const categoryId = '22222222-2222-2222-2222-222222222222';
    const result = listCoursesQuerySchema.parse({ categoryId });
    expect(result.categoryId).toBe(categoryId);
  });

  it('rejects an invalid categoryId uuid', () => {
    expect(() => listCoursesQuerySchema.parse({ categoryId: 'not-a-uuid' })).toThrow();
  });

  it('accepts draft/published status values', () => {
    expect(listCoursesQuerySchema.parse({ status: 'draft' }).status).toBe('draft');
    expect(listCoursesQuerySchema.parse({ status: 'published' }).status).toBe('published');
  });

  it('rejects an invalid status value', () => {
    expect(() => listCoursesQuerySchema.parse({ status: 'archived' })).toThrow();
  });

  it('parses combined trackId, categoryId, and status filters', () => {
    const trackId = '11111111-1111-1111-1111-111111111111';
    const categoryId = '22222222-2222-2222-2222-222222222222';
    const result = listCoursesQuerySchema.parse({ trackId, categoryId, status: 'published' });
    expect(result).toMatchObject({ trackId, categoryId, status: 'published' });
  });
});
