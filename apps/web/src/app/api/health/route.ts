import { NextResponse } from 'next/server';
import { prisma } from '@biolab/database';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
      database: { status: string; latency?: number; error?: string };
      redis: { status: string; latency?: number; error?: string };
    };
    version: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
    },
    version: process.env.APP_VERSION || '1.0.0',
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    health.checks.database = {
      status: dbLatency < 1000 ? 'healthy' : 'degraded',
      latency: dbLatency,
    };
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'unhealthy';
  }

  // Check Redis connection (if configured)
  if (process.env.REDIS_URL) {
    try {
      const Redis = (await import('ioredis')).default;
      const redis = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });

      const redisStart = Date.now();
      await redis.ping();
      const redisLatency = Date.now() - redisStart;

      health.checks.redis = {
        status: redisLatency < 500 ? 'healthy' : 'degraded',
        latency: redisLatency,
      };

      await redis.quit();

      if (redisLatency >= 500) {
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.redis = {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      // Redis is optional, don't mark as unhealthy
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
  } else {
    health.checks.redis = {
      status: 'not_configured',
    };
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
