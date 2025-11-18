# Docker Setup Guide

This project includes complete Docker support for both development and production environments.

## Quick Start

### Development

```bash
# Start all services (PostgreSQL + Redis + Web Dev + Dev Tools)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d

# View logs
docker-compose logs -f web-dev

# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Access:
- **App**: http://localhost:3000
- **PgAdmin**: http://localhost:5050 (admin@biolab.local / admin)
- **Redis Commander**: http://localhost:8081
- **Prisma Studio**: http://localhost:5555

### Production

```bash
# Build and start production services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

## Services

### Core Services (Always Running)

- **postgres**: PostgreSQL 16 database on port 5432
- **redis**: Redis 7 cache on port 6379
- **web**: Next.js application on port 3000

### Development Services (--profile dev)

- **web-dev**: Hot-reload development server
- **pgadmin**: Database GUI management
- **redis-commander**: Redis GUI management
- **prisma-studio**: Database schema explorer

## Environment Variables

Create `.env` file in root:

```env
# Required
NEXTAUTH_SECRET=your-secret-min-32-chars

# Optional (defaults provided in docker-compose)
DATABASE_URL=postgresql://biolab:biolab_dev_password@postgres:5432/biolab
REDIS_URL=redis://:redis_dev_password@redis:6379
NEXTAUTH_URL=http://localhost:3000
```

## Common Commands

### Database Operations

```bash
# Run migrations
docker-compose exec web pnpm db:migrate:deploy

# Seed database
docker-compose exec web pnpm db:seed

# Open Prisma Studio
docker-compose --profile dev up -d prisma-studio

# Backup database
docker-compose exec postgres pg_dump -U biolab biolab > backup.sql

# Restore database
docker-compose exec -T postgres psql -U biolab biolab < backup.sql
```

### Application Management

```bash
# Rebuild after code changes (production)
docker-compose up -d --build web

# View application logs
docker-compose logs -f web

# Restart application
docker-compose restart web

# Shell into container
docker-compose exec web sh
```

### Clean Up

```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes (⚠️ deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Production Deployment

### Build Production Image

```bash
# Build multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 -t biolab-platform:latest .

# Push to registry
docker tag biolab-platform:latest your-registry/biolab-platform:latest
docker push your-registry/biolab-platform:latest
```

### Deploy with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml biolab

# Scale service
docker service scale biolab_web=3

# View services
docker service ls
docker service logs biolab_web
```

### Deploy with Kubernetes

```bash
# Generate K8s manifests
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f .

# Check status
kubectl get pods
kubectl logs -f deployment/biolab-web
```

## Troubleshooting

### Connection Issues

```bash
# Check if services are running
docker-compose ps

# Check service health
docker-compose exec postgres pg_isready -U biolab
docker-compose exec redis redis-cli ping

# View network
docker network inspect biolab-network
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Prune unused resources
docker system prune -a --volumes
```

### Build Issues

```bash
# Clean build cache
docker buildx prune

# Build without cache
docker-compose build --no-cache

# Check build logs
docker-compose build web 2>&1 | tee build.log
```

## Security Notes

1. **Change default passwords** in production
2. **Use secrets** for sensitive values
3. **Enable SSL/TLS** for external access
4. **Restrict network access** with firewall rules
5. **Keep images updated** with `docker-compose pull`

## Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' biolab-postgres
```

## Monitoring

Consider adding these services for production:

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Loki**: Log aggregation
- **Traefik**: Reverse proxy with auto-SSL

## Backup Strategy

```bash
# Automated daily backups (add to cron)
docker-compose exec postgres pg_dump -U biolab biolab | gzip > backups/biolab-$(date +%Y%m%d).sql.gz

# Keep last 30 days
find backups/ -name "*.sql.gz" -mtime +30 -delete
```
