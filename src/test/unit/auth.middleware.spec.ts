import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdToken = vi.fn();
vi.mock('@config/firebase', () => ({
  firebaseAuth: { verifyIdToken },
}));

const { AuthMiddleware } = await import('@middlewares/auth.middleware');

const makeReq = (authHeader?: string) =>
  ({
    header: (name: string) => (name === 'Authorization' ? authHeader : undefined),
  }) as unknown as Request;

describe('AuthMiddleware', () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  it('rejects when no Authorization header is present', async () => {
    const next = vi.fn() as unknown as NextFunction;
    await AuthMiddleware(makeReq(), {} as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'Authentication token missing' }),
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects an expired token with a specific message', async () => {
    verifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });
    const next = vi.fn() as unknown as NextFunction;

    await AuthMiddleware(makeReq('Bearer expired-token'), {} as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'Authentication token expired' }),
    );
  });

  it('rejects any other verification failure as invalid', async () => {
    verifyIdToken.mockRejectedValue(new Error('boom'));
    const next = vi.fn() as unknown as NextFunction;

    await AuthMiddleware(makeReq('Bearer garbage'), {} as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'Invalid authentication token' }),
    );
  });

  it('attaches decoded claims to the request on success', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'uid-1', email: 'a@b.com', name: 'A B' });
    const next = vi.fn() as unknown as NextFunction;
    const req = makeReq('Bearer good-token');

    await AuthMiddleware(req, {} as Response, next);

    expect((req as unknown as { user: unknown }).user).toEqual({
      uid: 'uid-1',
      email: 'a@b.com',
      name: 'A B',
    });
    expect(next).toHaveBeenCalledWith();
  });
});
