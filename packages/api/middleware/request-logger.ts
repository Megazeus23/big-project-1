import { middleware } from '../index';
import { logRequest, logPerformance } from './logger';

/**
 * Middleware to log all TRPC requests
 */
export const requestLoggerMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const start = Date.now();

  const result = await next({
    ctx: {
      ...ctx,
      // Add request ID for tracing
      requestId: Math.random().toString(36).substring(7),
    },
  });

  const duration = Date.now() - start;

  // Log request
  logRequest({
    method: type,
    path,
    userId: (ctx.session?.user as any)?.id,
    duration,
    statusCode: result.ok ? 200 : 500,
  });

  // Log slow requests
  if (duration > 1000) {
    logPerformance({
      operation: `${type}:${path}`,
      duration,
      metadata: {
        userId: (ctx.session?.user as any)?.id,
      },
    });
  }

  return result;
});
