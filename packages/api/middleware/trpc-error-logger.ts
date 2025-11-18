import { TRPCError } from '@trpc/server';
import { logger } from './logger';

/**
 * TRPC error logging middleware
 */
export function onError({
  error,
  type,
  path,
  input,
  ctx,
  req,
}: {
  error: TRPCError;
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: any;
  req: any;
}) {
  // Log error with context
  logger.error({
    type: 'trpc_error',
    code: error.code,
    message: error.message,
    path,
    operationType: type,
    userId: ctx?.session?.user?.id,
    input: process.env.NODE_ENV === 'development' ? input : undefined,
    stack: error.stack,
    cause: error.cause,
  });

  // Send to error tracking service (e.g., Sentry) in production
  if (process.env.NODE_ENV === 'production' && shouldReportError(error)) {
    // Sentry.captureException(error, {
    //   contexts: {
    //     trpc: {
    //       path,
    //       type,
    //       code: error.code,
    //     },
    //   },
    //   user: ctx?.session?.user ? {
    //     id: ctx.session.user.id,
    //     email: ctx.session.user.email,
    //   } : undefined,
    // });
  }
}

/**
 * Determine if error should be reported to external service
 */
function shouldReportError(error: TRPCError): boolean {
  // Don't report client errors (4xx)
  const clientErrorCodes = [
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'PRECONDITION_FAILED',
    'PAYLOAD_TOO_LARGE',
  ];

  return !clientErrorCodes.includes(error.code);
}
