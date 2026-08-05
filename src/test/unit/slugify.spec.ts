import { slugify } from '@utils/slugify';
import { describe, expect, it } from 'vitest';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Web Development')).toBe('web-development');
  });

  it('strips punctuation', () => {
    expect(slugify("Beginner's Guide!")).toBe('beginner-s-guide');
  });

  it('collapses consecutive non-alphanumeric runs into a single hyphen', () => {
    expect(slugify('Data   Science & AI')).toBe('data-science-ai');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  -Mobile Dev-  ')).toBe('mobile-dev');
  });

  it('leaves numbers and lowercase letters untouched', () => {
    expect(slugify('web3 basics')).toBe('web3-basics');
  });
});
