import { Redis } from 'ioredis';
import { logger } from './logger';

/**
 * Redis cache client singleton
 */
class CacheClient {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    if (process.env.REDIS_URL) {
      this.connect();
    } else {
      logger.warn('REDIS_URL not configured, caching disabled');
    }
  }

  private connect() {
    try {
      this.client = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis cache connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.error('Redis cache error', { error: err.message });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis cache connection closed');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis cache', { error });
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, ttlSeconds?: number): Promise<number | null> {
    if (!this.client || !this.isConnected) return null;

    try {
      const value = await this.client.incr(key);
      if (ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      return null;
    }
  }

  /**
   * Get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client || !this.isConnected || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const values = await this.client.mget(...keys);
      return values.map((val) => (val ? JSON.parse(val) : null));
    } catch (error) {
      logger.error('Cache mget error', { keys, error });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys
   */
  async mset(entries: Array<{ key: string; value: unknown; ttl?: number }>): Promise<boolean> {
    if (!this.client || !this.isConnected || entries.length === 0) return false;

    try {
      const pipeline = this.client.pipeline();

      for (const { key, value, ttl = 300 } of entries) {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttl, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error', { error });
      return false;
    }
  }

  /**
   * Flush all cache (use with caution!)
   */
  async flush(): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      await this.client.flushdb();
      logger.warn('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error });
      return false;
    }
  }
}

// Export singleton instance
export const cache = new CacheClient();

/**
 * Cache key builders
 */
export const cacheKeys = {
  client: (id: string) => `client:${id}`,
  clientList: (filters: string) => `client:list:${filters}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  document: (id: string) => `document:${id}`,
  task: (id: string) => `task:${id}`,
  user: (id: string) => `user:${id}`,
  stats: (type: string) => `stats:${type}`,
};

/**
 * TRPC caching middleware
 */
export function createCacheMiddleware(opts: {
  keyBuilder: (input: any) => string;
  ttl?: number;
  invalidateOn?: string[];
}) {
  return async function cacheMiddleware({ ctx, input, next, path }: any) {
    const cacheKey = opts.keyBuilder(input);
    const ttl = opts.ttl || 300; // 5 minutes default

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { key: cacheKey, path });
      return { ...cached, _cached: true };
    }

    // Execute procedure
    const result = await next();

    // Store in cache if successful
    if (result && !result.error) {
      await cache.set(cacheKey, result, ttl);
      logger.debug('Cache set', { key: cacheKey, path, ttl });
    }

    return result;
  };
}

/**
 * Cache invalidation helper
 */
export async function invalidateCache(patterns: string | string[]) {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];

  for (const pattern of patternArray) {
    const deleted = await cache.deletePattern(pattern);
    if (deleted > 0) {
      logger.info('Cache invalidated', { pattern, keysDeleted: deleted });
    }
  }
}

/**
 * Example usage in procedures:
 *
 * // List procedure with caching
 * list: protectedProcedure
 *   .use(createCacheMiddleware({
 *     keyBuilder: (input) => cacheKeys.clientList(JSON.stringify(input)),
 *     ttl: 300,
 *   }))
 *   .input(...)
 *   .query(...)
 *
 * // Mutation that invalidates cache
 * create: protectedProcedure
 *   .input(...)
 *   .mutation(async ({ input }) => {
 *     const result = await prisma.client.create({ data: input });
 *     await invalidateCache('client:list:*');
 *     return result;
 *   })
 */
