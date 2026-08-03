import { UsersRepository } from '@repositories/users.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@config/prisma', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '@config/prisma';

describe('UsersRepository.upsert', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.upsert).mockReset();
  });

  it('updates only non-empty identity fields, never role or bio', async () => {
    const repo = new UsersRepository();
    const data = { firebaseUid: 'uid-1', email: 'a@b.com', firstName: 'A', lastName: 'B' };

    await repo.upsert(data);

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { firebaseUid: 'uid-1' },
      create: data,
      update: { email: 'a@b.com', firstName: 'A', lastName: 'B' },
    });
  });

  it('omits blank identity fields from the update payload', async () => {
    const repo = new UsersRepository();
    const data = { firebaseUid: 'uid-2', email: '', firstName: 'Jane', lastName: '' };

    await repo.upsert(data);

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { firebaseUid: 'uid-2' },
      create: data,
      update: { firstName: 'Jane' },
    });
  });
});
