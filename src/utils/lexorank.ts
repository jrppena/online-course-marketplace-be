import { LexoRank } from 'lexorank';

export const rankBetween = (before?: string, after?: string): string => {
  if (!before && !after) return LexoRank.middle().toString();
  if (!before)
    return LexoRank.min()
      .between(LexoRank.parse(after as string))
      .toString();
  if (!after) return LexoRank.parse(before).genNext().toString();
  return LexoRank.parse(before).between(LexoRank.parse(after)).toString();
};
