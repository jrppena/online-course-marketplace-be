import { ForbiddenError } from '@casl/ability';
import { NODE_ENV } from '@config/env';
import { HttpException } from '@exceptions/http.exception';
import {
  HTTP_ERROR_MESSAGES,
  type StandardErrorResponse,
  type ValidationErrorDetail,
} from '@interfaces/error.interface';
import { logger } from '@utils/logger';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

type HttpExceptionWithData = HttpException & { data?: unknown };
type WithStack = { stack?: string };

const isZodError = (e: unknown): e is ZodError => {
  return e instanceof ZodError;
};

const toHttpException = (err: unknown): HttpException => {
  if (err instanceof HttpException) return err;

  if (isZodError(err)) {
    const details: ValidationErrorDetail[] = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      value: (issue as { received?: unknown }).received || undefined,
    }));
    return new HttpException(400, 'Validation failed', details);
  }

  if (err instanceof ForbiddenError) {
    return new HttpException(403, err.message);
  }

  const e = err as Error | undefined;
  return new HttpException(500, e?.message || 'Internal Server Error');
};

const extractStack = (err: unknown): string | undefined => {
  if (err && typeof err === 'object' && 'stack' in err) {
    const s = (err as WithStack).stack;
    return typeof s === 'string' ? s : undefined;
  }
  return undefined;
};

export const ErrorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const httpErr = toHttpException(error);
  const status = httpErr.status || 500;
  const message =
    httpErr.message ||
    HTTP_ERROR_MESSAGES[status as keyof typeof HTTP_ERROR_MESSAGES] ||
    'Something went wrong';

  if (res.headersSent) return _next(httpErr);

  const stack = extractStack(httpErr);
  logger.error(
    `[${req.method}] ${req.originalUrl} | ${status} | ${message}${stack ? `\n${stack}` : ''}`,
  );

  // FE (src/lib/api-client.ts) reads `response.data.message` directly — keep this flat.
  const errorResponse: StandardErrorResponse = { message };

  const maybeDetails = (httpErr as HttpExceptionWithData).data;
  if (typeof maybeDetails !== 'undefined') {
    errorResponse.details = maybeDetails;
  }

  if (NODE_ENV === 'development' && stack) {
    errorResponse.details = {
      ...(typeof errorResponse.details === 'object' ? errorResponse.details : {}),
      stack,
    };
  }

  res.status(status).json(errorResponse);
};
