import { TRPCError } from '@trpc/server';
import { logger } from './logger';

/**
 * Security headers middleware
 */
export function securityHeaders(req: any, res: any) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (adjust as needed)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

/**
 * CORS configuration
 */
export function configureCORS(req: any, res: any) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

/**
 * Request size limit middleware
 */
export function checkRequestSize(input: unknown, maxSizeBytes: number = 1024 * 1024) {
  const size = JSON.stringify(input).length;

  if (size > maxSizeBytes) {
    logger.warn('Request size exceeded', { size, maxSizeBytes });
    throw new TRPCError({
      code: 'PAYLOAD_TOO_LARGE',
      message: `Request payload too large. Maximum size: ${maxSizeBytes} bytes`,
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return function roleMiddleware({ ctx, next }: any) {
    const userRole = ctx.session?.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn('Unauthorized role access attempt', {
        userId: ctx.session?.user?.id,
        userRole,
        allowedRoles,
      });

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
}

/**
 * IP whitelist middleware
 */
export function requireWhitelistedIP(whitelist: string[]) {
  return function ipWhitelistMiddleware({ ctx, next }: any) {
    const ip = ctx.req?.headers?.['x-forwarded-for'] || ctx.req?.socket?.remoteAddress;

    if (!ip || !whitelist.includes(ip as string)) {
      logger.warn('IP not whitelisted', { ip, whitelist });

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied from this IP address',
      });
    }

    return next();
  };
}

/**
 * Audit logging for sensitive operations
 */
export function auditLog(operation: string) {
  return function auditMiddleware({ ctx, next, input }: any) {
    const userId = ctx.session?.user?.id;
    const timestamp = new Date().toISOString();

    logger.info('Audit log', {
      operation,
      userId,
      timestamp,
      input: sanitizeForLog(input),
    });

    return next();
  };
}

/**
 * Sanitize sensitive data before logging
 */
function sanitizeForLog(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
