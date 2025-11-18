# Monitoring & Observability Guide

This project includes comprehensive monitoring and observability features.

## Health Checks

### Application Health
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": { "status": "healthy", "latency": 15 },
    "redis": { "status": "healthy", "latency": 5 }
  },
  "version": "1.0.0"
}
```

Status codes:
- `200` - Healthy or Degraded
- `503` - Unhealthy

### Prometheus Metrics
```bash
curl http://localhost:3000/api/metrics
```

## Logging

### Log Levels
- `error` - Error events
- `warn` - Warning events
- `info` - Informational messages (default)
- `debug` - Debug messages
- `trace` - Very detailed debug

### Configuration
```env
# Set log level
LOG_LEVEL=debug

# Pretty print in development (automatic)
NODE_ENV=development
```

### Log Types

#### Request Logs
```json
{
  "type": "request",
  "method": "query",
  "path": "client.list",
  "userId": "user-123",
  "duration": 150,
  "statusCode": 200
}
```

#### Error Logs
```json
{
  "type": "trpc_error",
  "code": "NOT_FOUND",
  "message": "Client not found",
  "path": "client.getById",
  "userId": "user-123",
  "stack": "..."
}
```

#### Performance Logs
```json
{
  "type": "performance",
  "operation": "query:client.list",
  "duration": 1250,
  "userId": "user-123"
}
```

#### Audit Logs
```json
{
  "type": "audit",
  "action": "client.delete",
  "userId": "admin-123",
  "resource": "client",
  "resourceId": "client-456",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Metrics Collection

### Application Metrics

Built-in metrics:
- Request count per endpoint
- Average response time per endpoint
- Error count per endpoint
- Memory usage
- CPU usage
- Event loop utilization

### Custom Business Metrics

```typescript
import { businessMetrics } from '@biolab/api/middleware/monitoring';

// Increment counter
businessMetrics.increment('clients.created');
businessMetrics.increment('revenue', 1000);

// Set gauge
businessMetrics.setGauge('active_users', 42);

// Get metrics
const counters = businessMetrics.getCounters();
const gauges = businessMetrics.getGauges();
```

## Performance Monitoring

### Slow Query Detection

Automatically logs queries taking > 500ms:
```json
{
  "level": "warn",
  "message": "Slow database query",
  "model": "Client",
  "action": "findMany",
  "duration": 750
}
```

### Slow Request Detection

Automatically logs requests taking > 1000ms:
```json
{
  "level": "warn",
  "type": "performance",
  "operation": "query:client.list",
  "duration": 1250
}
```

## APM Integration

### OpenTelemetry

```typescript
import { tracer } from '@biolab/api/middleware/monitoring';

// Start span
tracer.startSpan('process-invoice', { invoiceId: '123' });

// ... do work ...

// End span
tracer.endSpan('process-invoice', { status: 'completed' });
```

### Supported APM Services
- Datadog
- New Relic
- OpenTelemetry Collector
- Elastic APM
- Jaeger

## Error Tracking

### Sentry Integration (Optional)

Install:
```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  // Your Next.js config
  {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
    },
  }
);
```

## Alerting

### Health Check Monitoring

Use services like:
- **Better Stack** (uptime.betterstack.com)
- **Checkly** (checkly.com)
- **UptimeRobot** (uptimerobot.com)

Configure alerts:
```yaml
url: https://your-app.com/api/health
interval: 60s
alert_on:
  - status_code != 200
  - response_time > 1000ms
  - checks.database.status != "healthy"
```

### Log-based Alerts

Configure alerts in your log aggregation service:
- Error rate > 10 per minute
- Response time P95 > 2000ms
- Database latency > 1000ms
- Memory usage > 80%

## Dashboards

### Recommended Tools

**Free/Open Source:**
- Grafana + Prometheus
- ELK Stack (Elasticsearch + Logstash + Kibana)
- Grafana Loki + Promtail

**Commercial:**
- Datadog
- New Relic
- Dynatrace
- AppDynamics

### Sample Grafana Dashboard

```yaml
Dashboard Panels:
- Request Rate (req/s)
- Average Response Time (ms)
- Error Rate (%)
- Database Query Time (ms)
- Memory Usage (MB)
- CPU Usage (%)
- Active Users
- Cache Hit Rate (%)
```

## Performance Optimization

### Identifying Bottlenecks

1. Check `/api/health` for service latency
2. Review logs for slow queries/requests
3. Monitor memory usage trends
4. Check cache hit rates
5. Analyze error patterns

### Performance Targets

- API response time P50: < 200ms
- API response time P95: < 1000ms
- API response time P99: < 2000ms
- Database query time: < 100ms
- Error rate: < 1%
- Uptime: > 99.9%

## Troubleshooting

### High Memory Usage
```bash
# Get memory metrics
curl http://localhost:3000/api/metrics | grep memory

# Check for memory leaks
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev
```

### High CPU Usage
```bash
# Profile CPU usage
node --cpu-prof apps/web/server.js

# Analyze with flamegraphs
npx 0x apps/web/server.js
```

### Database Connection Issues
```bash
# Check database health
curl http://localhost:3000/api/health | jq '.checks.database'

# View database logs
docker-compose logs postgres
```

### Cache Issues
```bash
# Check Redis health
curl http://localhost:3000/api/health | jq '.checks.redis'

# View Redis logs
docker-compose logs redis

# Flush cache
docker-compose exec redis redis-cli FLUSHDB
```

## Best Practices

1. **Always monitor health endpoints** in production
2. **Set up alerts** for critical metrics
3. **Review logs regularly** for patterns
4. **Track business metrics** for insights
5. **Use APM** for distributed tracing
6. **Optimize slow queries** identified in logs
7. **Monitor cache hit rates** and adjust TTLs
8. **Set up dashboards** for visibility
9. **Perform load testing** regularly
10. **Document incidents** and improvements
