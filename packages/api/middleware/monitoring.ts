import { logger, logPerformance } from './logger';

/**
 * Request metrics collector
 */
class MetricsCollector {
  private requestCounts: Map<string, number> = new Map();
  private requestDurations: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();

  incrementRequest(path: string) {
    this.requestCounts.set(path, (this.requestCounts.get(path) || 0) + 1);
  }

  recordDuration(path: string, duration: number) {
    const durations = this.requestDurations.get(path) || [];
    durations.push(duration);

    // Keep last 100 requests
    if (durations.length > 100) {
      durations.shift();
    }

    this.requestDurations.set(path, durations);
  }

  incrementError(path: string) {
    this.errorCounts.set(path, (this.errorCounts.get(path) || 0) + 1);
  }

  getMetrics() {
    const metrics: {
      requests: Record<string, number>;
      averageDurations: Record<string, number>;
      errors: Record<string, number>;
    } = {
      requests: {},
      averageDurations: {},
      errors: {},
    };

    // Request counts
    for (const [path, count] of this.requestCounts.entries()) {
      metrics.requests[path] = count;
    }

    // Average durations
    for (const [path, durations] of this.requestDurations.entries()) {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      metrics.averageDurations[path] = Math.round(avg);
    }

    // Error counts
    for (const [path, count] of this.errorCounts.entries()) {
      metrics.errors[path] = count;
    }

    return metrics;
  }

  reset() {
    this.requestCounts.clear();
    this.requestDurations.clear();
    this.errorCounts.clear();
  }
}

export const metrics = new MetricsCollector();

/**
 * Performance monitoring middleware
 */
export function monitoringMiddleware({ path, type, next }: any) {
  const start = Date.now();
  const fullPath = `${type}:${path}`;

  metrics.incrementRequest(fullPath);

  return next().then(
    (result: any) => {
      const duration = Date.now() - start;
      metrics.recordDuration(fullPath, duration);

      // Log slow queries
      if (duration > 1000) {
        logPerformance({
          operation: fullPath,
          duration,
          metadata: { slow: true },
        });
      }

      return result;
    },
    (error: any) => {
      const duration = Date.now() - start;
      metrics.incrementError(fullPath);
      metrics.recordDuration(fullPath, duration);

      throw error;
    }
  );
}

/**
 * Application Performance Monitoring (APM) integration
 */
export class APMTracer {
  private spans: Map<string, { start: number; metadata: any }> = new Map();

  startSpan(name: string, metadata?: Record<string, any>) {
    this.spans.set(name, {
      start: Date.now(),
      metadata: metadata || {},
    });
  }

  endSpan(name: string, additionalMetadata?: Record<string, any>) {
    const span = this.spans.get(name);
    if (!span) return;

    const duration = Date.now() - span.start;

    logger.debug('Span completed', {
      name,
      duration,
      ...span.metadata,
      ...additionalMetadata,
    });

    this.spans.delete(name);

    // Send to APM service (e.g., Datadog, New Relic, OpenTelemetry)
    if (process.env.APM_ENABLED === 'true') {
      this.sendToAPM(name, duration, { ...span.metadata, ...additionalMetadata });
    }
  }

  private sendToAPM(name: string, duration: number, metadata: Record<string, any>) {
    // Integration with APM services
    // Example: Datadog, New Relic, OpenTelemetry, etc.
    // dd.trace.span(name, { duration, ...metadata });
  }
}

export const tracer = new APMTracer();

/**
 * Database query monitoring
 */
export function monitorQuery(model: string, action: string, duration: number) {
  if (duration > 500) {
    logger.warn('Slow database query', {
      model,
      action,
      duration,
    });
  }

  logger.debug('Database query', {
    model,
    action,
    duration,
  });
}

/**
 * Custom business metrics
 */
export class BusinessMetrics {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();

  increment(metric: string, value: number = 1) {
    this.counters.set(metric, (this.counters.get(metric) || 0) + value);
  }

  setGauge(metric: string, value: number) {
    this.gauges.set(metric, value);
  }

  getCounters() {
    return Object.fromEntries(this.counters);
  }

  getGauges() {
    return Object.fromEntries(this.gauges);
  }
}

export const businessMetrics = new BusinessMetrics();
