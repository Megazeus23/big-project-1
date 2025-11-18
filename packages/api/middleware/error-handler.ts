import { TRPCError } from '@trpc/server';
import { logger } from './logger';

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

/**
 * Convert AppError to TRPCError
 */
export function toTRPCError(error: unknown): TRPCError {
  // Already a TRPC error
  if (error instanceof TRPCError) {
    return error;
  }

  // Custom AppError
  if (error instanceof AppError) {
    logger.error('Application error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    return new TRPCError({
      code: mapStatusCodeToTRPCCode(error.statusCode),
      message: error.message,
      cause: error,
    });
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    if (prismaError.code === 'P2002') {
      return new TRPCError({
        code: 'CONFLICT',
        message: 'A record with this value already exists',
      });
    }

    if (prismaError.code === 'P2025') {
      return new TRPCError({
        code: 'NOT_FOUND',
        message: 'Record not found',
      });
    }
  }

  // Generic error
  logger.error('Unexpected error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error instanceof Error ? error.message : 'Unknown error',
    cause: error,
  });
}

/**
 * Map HTTP status codes to TRPC error codes
 */
function mapStatusCodeToTRPCCode(statusCode: number): TRPCError['code'] {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

/**
 * Error logging middleware
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (error instanceof AppError) {
    if (error.isOperational) {
      logger.warn('Operational error', {
        code: error.code,
        message: error.message,
        ...context,
      });
    } else {
      logger.error('Non-operational error', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        ...context,
      });
    }
  } else if (error instanceof Error) {
    logger.error('Unhandled error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  } else {
    logger.error('Unknown error type', {
      error: String(error),
      ...context,
    });
  }
}
