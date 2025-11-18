# Architecture Documentation

## Overview

BioLab Platform is a monorepo-based enterprise management system built with modern web technologies, following microservices-inspired patterns within a monolithic deployment.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **tRPC** - End-to-end type-safe APIs
- **React Query** - Server state management
- **Zustand** - Client state management

### Backend
- **Next.js API Routes** - Serverless functions
- **tRPC** - Type-safe API layer
- **Prisma ORM** - Database ORM with migrations
- **NextAuth.js** - Authentication
- **PostgreSQL** - Primary database
- **Redis** - Caching and rate limiting

### DevOps
- **Turborepo** - Monorepo build system
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel** - Hosting (optional)
- **pnpm** - Package manager

## Project Structure

```
biolab-platform/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   │   ├── (auth)/    # Auth routes
│       │   │   ├── (dashboard)/ # Protected routes
│       │   │   └── api/       # API routes
│       │   ├── components/    # React components
│       │   ├── lib/          # Utilities
│       │   └── styles/       # Global styles
│       ├── public/           # Static assets
│       ├── e2e/             # Playwright tests
│       └── package.json
│
├── packages/
│   ├── api/                  # tRPC API layer
│   │   ├── routers/         # API routers
│   │   ├── middleware/      # Middleware
│   │   ├── __tests__/       # Unit tests
│   │   └── index.ts
│   │
│   ├── database/            # Prisma database
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── index.ts
│   │   └── seed.ts
│   │
│   ├── auth/               # Authentication
│   │   └── index.ts
│   │
│   ├── ui/                 # Shared UI components
│   │   ├── components/
│   │   └── lib/
│   │
│   └── config/            # Shared configs
│
├── .github/
│   └── workflows/         # CI/CD workflows
│
├── docker-compose.yml     # Docker setup
├── Dockerfile            # Production image
└── turbo.json           # Turborepo config
```

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│     (Next.js Pages & Components)    │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Application Layer           │
│         (tRPC Procedures)           │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│       (Service Functions)           │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Data Access Layer           │
│         (Prisma ORM)                │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Database Layer              │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

### Request Flow

```
1. User Action (Frontend)
   ↓
2. tRPC Client Request
   ↓
3. Middleware Pipeline
   - Request Logger
   - Rate Limiter
   - Authentication
   - Input Sanitization
   - Caching (optional)
   ↓
4. Procedure Handler
   ↓
5. Business Logic
   ↓
6. Database Query (Prisma)
   ↓
7. Response Transformation
   ↓
8. Cache Storage (if applicable)
   ↓
9. Client Update (React Query)
```

## Data Flow

### Read Operations
```
Client → tRPC → Cache Check → DB Query → Transform → Cache Store → Response
```

### Write Operations
```
Client → tRPC → Validate → DB Mutation → Cache Invalidate → Audit Log → Response
```

## Authentication & Authorization

### Authentication Flow
```
1. User submits credentials
2. NextAuth validates credentials
3. Session created with JWT
4. Session stored in database
5. JWT cookie sent to client
6. Subsequent requests include JWT
7. Middleware validates JWT
8. User context attached to request
```

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Valid session required
- **Role-based**: Specific role required (ADMIN, CONSULTANT, etc.)
- **Resource-based**: Ownership or permission check

## Caching Strategy

### Cache Levels

1. **Browser Cache** (Static assets)
   - Images, CSS, JS: 1 year
   - HTML: No cache

2. **CDN Cache** (Vercel Edge)
   - Static pages: 1 hour
   - API responses: No cache

3. **Redis Cache** (Application)
   - Dashboard stats: 5 minutes
   - Client lists: 5 minutes
   - Individual records: 15 minutes

4. **Database Cache** (PostgreSQL)
   - Query plan cache: Automatic
   - Shared buffers: 256MB

### Cache Invalidation

```typescript
// On mutation
await prisma.client.create(...)
await invalidateCache('client:list:*')
```

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│     1. Network Layer (HTTPS)        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     2. WAF / DDoS Protection        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     3. Rate Limiting                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     4. Authentication               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     5. Authorization                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     6. Input Validation             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     7. Output Encoding              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     8. Audit Logging                │
└─────────────────────────────────────┘
```

### Security Features

- ✅ HTTPS/TLS encryption
- ✅ Secure headers (CSP, HSTS, etc.)
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection prevention (Prisma)
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Authentication (NextAuth)
- ✅ Authorization (RBAC)
- ✅ Audit logging
- ✅ Secret management (env vars)

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────┐
│         Load Balancer               │
└─────────────────────────────────────┘
         ↓         ↓         ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│ App #1  │  │ App #2  │  │ App #3  │
└─────────┘  └─────────┘  └─────────┘
         ↓         ↓         ↓
┌─────────────────────────────────────┐
│         Redis Cluster               │
└─────────────────────────────────────┘
         ↓         ↓         ↓
┌─────────────────────────────────────┐
│      PostgreSQL (Primary)           │
│      + Read Replicas                │
└─────────────────────────────────────┘
```

### Performance Optimizations

- **Database**: Connection pooling, indexes, materialized views
- **Caching**: Redis for hot data, browser caching
- **CDN**: Static assets on edge network
- **Code splitting**: Dynamic imports, route-based chunks
- **Image optimization**: Next.js Image component
- **API**: Request batching, pagination, field filtering

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────┐
│         Vercel Edge Network         │
│         (CDN + Serverless)          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Next.js Application         │
│         (Serverless Functions)      │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Managed Services            │
│  - PostgreSQL (Neon/Supabase)      │
│  - Redis (Upstash)                 │
│  - Storage (S3/R2)                 │
└─────────────────────────────────────┘
```

### Self-Hosted Setup

```
┌─────────────────────────────────────┐
│         Nginx / Traefik             │
│         (Reverse Proxy)             │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Docker Swarm / K8s Cluster     │
│  - Next.js containers (3x)          │
│  - PostgreSQL cluster               │
│  - Redis cluster                    │
└─────────────────────────────────────┘
```

## Monitoring & Observability

### Metrics Collection

- **Application Metrics**: Request rate, latency, errors
- **Business Metrics**: Active users, revenue, conversions
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Database Metrics**: Query time, connections, deadlocks

### Logging Strategy

- **Structured Logging**: JSON format with Pino
- **Log Levels**: error, warn, info, debug
- **Log Aggregation**: Centralized storage (Loki/ELK)
- **Log Retention**: 30 days rotating

### Alerting Rules

- Error rate > 1%
- Response time P95 > 2s
- Database latency > 1s
- Memory usage > 80%
- Disk usage > 85%

## Development Workflow

### Local Development
```bash
1. Clone repository
2. pnpm install
3. Setup .env file
4. docker-compose up -d (DB + Redis)
5. pnpm db:migrate:dev
6. pnpm db:seed
7. pnpm dev
```

### Feature Development
```bash
1. Create feature branch
2. Write code + tests
3. Run tests locally
4. Create pull request
5. CI/CD runs automatically
6. Code review
7. Merge to main
8. Auto-deploy to production
```

## Testing Strategy

### Test Pyramid

```
        ┌───────────┐
        │    E2E    │  10%
        ├───────────┤
        │Integration│  20%
        ├───────────┤
        │   Unit    │  70%
        └───────────┘
```

- **Unit Tests**: Jest for business logic
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for critical flows
- **Coverage Target**: 70%+ overall

## Future Enhancements

### Planned Features
- [ ] Real-time notifications (WebSockets)
- [ ] Document OCR (AI/ML)
- [ ] Mobile app (React Native)
- [ ] Multi-tenancy support
- [ ] Advanced analytics dashboard
- [ ] Email automation
- [ ] SMS notifications
- [ ] Third-party integrations

### Technical Improvements
- [ ] GraphQL Federation
- [ ] Event sourcing
- [ ] CQRS pattern
- [ ] Microservices extraction
- [ ] Kubernetes deployment
- [ ] Multi-region setup
