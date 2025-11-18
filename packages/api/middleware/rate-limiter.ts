import { TRPCError } from '@trpc/server';
import { Redis } from 'ioredis';
import { logger } from './logger';

// Redis client (singleton)
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not configured, rate limiting will use in-memory fallback');
    return null;
  }

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      logger.error('Redis connection error', { error: err.message });
    });

    redis.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });
  }

  return redis;
}

// In-memory fallback for rate limiting
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
}

/**
 * Default rate limit configurations
 */
export const rateLimitConfigs = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
} as const;

/**
 * Check rate limit for a given key
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = rateLimitConfigs.default
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisClient = getRedisClient();
  const now = Date.now();
  const windowKey = `ratelimit:${config.keyPrefix || 'default'}:${key}`;

  if (redisClient) {
    try {
      // Use Redis for distributed rate limiting
      const multi = redisClient.multi();
      const resetAt = now + config.windowMs;

      multi.incr(windowKey);
      multi.pexpire(windowKey, config.windowMs);
      multi.ttl(windowKey);

      const results = await multi.exec();
      if (!results) throw new Error('Redis transaction failed');

      const count = results[0][1] as number;
      const ttl = (results[2][1] as number) * 1000; // Convert to ms

      const allowed = count <= config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - count);

      return {
        allowed,
        remaining,
        resetAt: now + ttl,
      };
    } catch (error) {
      logger.error('Rate limit check failed (Redis)', { error });
      // Fallback to memory store on Redis error
      return checkRateLimitMemory(key, config, now);
    }
  } else {
    // Use in-memory store
    return checkRateLimitMemory(key, config, now);
  }
}

/**
 * In-memory rate limit fallback
 */
function checkRateLimitMemory(
  key: string,
  config: RateLimitConfig,
  now: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    // New window
    const resetAt = now + config.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  } else {
    // Within window
    existing.count++;
    const allowed = existing.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - existing.count);

    return {
      allowed,
      remaining,
      resetAt: existing.resetAt,
    };
  }
}

/**
 * TRPC middleware for rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware({ ctx, next }: any) {
    const userId = ctx.session?.user?.id;
    const ip = ctx.req?.headers?.['x-forwarded-for'] || ctx.req?.socket?.remoteAddress;

    // Use userId if authenticated, otherwise IP
    const key = userId || ip || 'anonymous';

    const { allowed, remaining, resetAt } = await checkRateLimit(key, config);

    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        key,
        config: config.keyPrefix,
        remaining,
        resetAt: new Date(resetAt).toISOString(),
      });

      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again after ${new Date(resetAt).toISOString()}`,
      });
    }

    // Add rate limit info to context
    return next({
      ctx: {
        ...ctx,
        rateLimit: {
          remaining,
          resetAt,
        },
      },
    });
  };
}

/**
 * Clean up in-memory store periodically (runs every 5 minutes)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (now > value.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
