import { rankBetween } from '@utils/lexorank';
import { LexoRank } from 'lexorank';
import { describe, expect, it } from 'vitest';

describe('rankBetween', () => {
  it('returns a middle rank when the list is empty', () => {
    expect(rankBetween(undefined, undefined)).toBe(LexoRank.middle().toString());
  });

  it('appends after the given rank when there is no after', () => {
    const before = LexoRank.middle().toString();
    expect(rankBetween(before, undefined)).toBe(LexoRank.parse(before).genNext().toString());
  });

  it('prepends before the given rank when there is no before', () => {
    const after = LexoRank.middle().toString();
    expect(rankBetween(undefined, after)).toBe(
      LexoRank.min().between(LexoRank.parse(after)).toString(),
    );
  });

  it('sorts between two ranks in order', () => {
    const before = LexoRank.min().toString();
    const after = LexoRank.max().toString();
    const rank = rankBetween(before, after);

    expect(LexoRank.parse(before).compareTo(LexoRank.parse(rank))).toBeLessThan(0);
    expect(LexoRank.parse(rank).compareTo(LexoRank.parse(after))).toBeLessThan(0);
  });
});
