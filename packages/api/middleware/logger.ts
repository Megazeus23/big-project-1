import pino from 'pino';

/**
 * Centralized logger configuration using Pino
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  ...(process.env.NODE_ENV === 'production'
    ? {
        redact: {
          paths: [
            'password',
            'token',
            'apiKey',
            'secret',
            '*.password',
            '*.token',
            '*.apiKey',
            '*.secret',
          ],
          remove: true,
        },
      }
    : {}),
});

/**
 * Request logger middleware
 */
export function logRequest(opts: {
  method: string;
  path: string;
  userId?: string;
  duration?: number;
  statusCode?: number;
}) {
  logger.info({
    type: 'request',
    method: opts.method,
    path: opts.path,
    userId: opts.userId,
    duration: opts.duration,
    statusCode: opts.statusCode,
  });
}

/**
 * Database query logger
 */
export function logQuery(opts: {
  model: string;
  action: string;
  duration: number;
}) {
  logger.debug({
    type: 'database',
    model: opts.model,
    action: opts.action,
    duration: opts.duration,
  });
}

/**
 * Audit log for important actions
 */
export function auditLog(opts: {
  action: string;
  userId: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}) {
  logger.info({
    type: 'audit',
    action: opts.action,
    userId: opts.userId,
    resource: opts.resource,
    resourceId: opts.resourceId,
    metadata: opts.metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Performance logger
 */
export function logPerformance(opts: {
  operation: string;
  duration: number;
  metadata?: Record<string, any>;
}) {
  const level = opts.duration > 1000 ? 'warn' : 'debug';
  logger[level]({
    type: 'performance',
    operation: opts.operation,
    duration: opts.duration,
    ...opts.metadata,
  });
}
