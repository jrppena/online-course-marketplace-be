import { firebaseAuth } from '@config/firebase';
import { HttpException } from '@exceptions/http.exception';
import type { RequestWithUser } from '@interfaces/auth.interface';
import type { NextFunction, Request, Response } from 'express';

const getBearerToken = (req: Request): string | null => {
  const header = req.header('Authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  return null;
};

export const AuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const token = getBearerToken(req);
  if (!token) return next(new HttpException(401, 'Authentication token missing'));

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);

    (req as RequestWithUser).user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/id-token-expired') {
      return next(new HttpException(401, 'Authentication token expired'));
    }
    return next(new HttpException(401, 'Invalid authentication token'));
  }
};
