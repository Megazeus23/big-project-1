import { NextResponse } from 'next/server';

/**
 * Prometheus-compatible metrics endpoint
 * GET /api/metrics
 */
export async function GET() {
  const metrics = generateMetrics();

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    },
  });
}

function generateMetrics(): string {
  const metrics: string[] = [];

  // Process metrics
  const memUsage = process.memoryUsage();
  metrics.push(
    '# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes',
    '# TYPE nodejs_memory_usage_bytes gauge',
    `nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
    `nodejs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`,
    `nodejs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`,
    `nodejs_memory_usage_bytes{type="external"} ${memUsage.external}`,
    ''
  );

  // Uptime
  metrics.push(
    '# HELP nodejs_process_uptime_seconds Node.js process uptime in seconds',
    '# TYPE nodejs_process_uptime_seconds gauge',
    `nodejs_process_uptime_seconds ${process.uptime()}`,
    ''
  );

  // CPU usage
  const cpuUsage = process.cpuUsage();
  metrics.push(
    '# HELP nodejs_cpu_usage_micros Node.js CPU usage in microseconds',
    '# TYPE nodejs_cpu_usage_micros counter',
    `nodejs_cpu_usage_micros{type="user"} ${cpuUsage.user}`,
    `nodejs_cpu_usage_micros{type="system"} ${cpuUsage.system}`,
    ''
  );

  // Event loop lag (if available)
  if (typeof performance !== 'undefined' && 'eventLoopUtilization' in performance) {
    const elu = (performance as any).eventLoopUtilization();
    metrics.push(
      '# HELP nodejs_eventloop_utilization Event loop utilization',
      '# TYPE nodejs_eventloop_utilization gauge',
      `nodejs_eventloop_utilization{type="active"} ${elu.active}`,
      `nodejs_eventloop_utilization{type="idle"} ${elu.idle}`,
      `nodejs_eventloop_utilization{type="utilization"} ${elu.utilization}`,
      ''
    );
  }

  return metrics.join('\n');
}
