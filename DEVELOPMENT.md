# Development Guide

Complete guide for developers working on BioLab Platform.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for local development)
- Git

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd big-project-1

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start databases
docker-compose up -d postgres redis

# Setup database
pnpm db:generate
pnpm db:migrate:dev
pnpm db:seed

# Start development server
pnpm dev
```

Access:
- Application: http://localhost:3000
- Prisma Studio: `pnpm db:studio` → http://localhost:5555

## Project Structure

### Apps

- **apps/web**: Main Next.js application
  - `src/app`: Next.js App Router pages
  - `src/components`: React components
  - `src/lib`: Utilities and helpers
  - `e2e`: End-to-end tests

### Packages

- **packages/api**: tRPC API layer
  - `routers/`: API endpoint definitions
  - `middleware/`: Middleware functions
  - `__tests__/`: Unit tests

- **packages/database**: Prisma ORM
  - `prisma/schema.prisma`: Database schema
  - `prisma/migrations/`: Migration files
  - `seed.ts`: Database seeding

- **packages/auth**: Authentication configuration
- **packages/ui**: Shared UI components
- **packages/config**: Shared configuration

## Development Workflow

### Creating a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Update database schema** (if needed)
   ```bash
   # Edit packages/database/prisma/schema.prisma
   pnpm db:migrate:dev --name add_my_feature
   ```

3. **Create API router** (if needed)
   ```typescript
   // packages/api/routers/myfeature.ts
   import { router, protectedProcedure } from '..';
   import { z } from 'zod';

   export const myFeatureRouter = router({
     list: protectedProcedure
       .query(async ({ ctx }) => {
         return ctx.prisma.myModel.findMany();
       }),
   });
   ```

4. **Add to main router**
   ```typescript
   // packages/api/index.ts
   import { myFeatureRouter } from './routers/myfeature';

   export const appRouter = router({
     // ...existing routers
     myFeature: myFeatureRouter,
   });
   ```

5. **Create UI components**
   ```typescript
   // apps/web/src/app/(dashboard)/myfeature/page.tsx
   'use client';

   import { trpc } from '@/lib/trpc/client';

   export default function MyFeaturePage() {
     const { data } = trpc.myFeature.list.useQuery();
     return <div>{/* Your UI */}</div>;
   }
   ```

6. **Write tests**
   ```typescript
   // packages/api/__tests__/myfeature.test.ts
   describe('MyFeature Router', () => {
     it('should list items', async () => {
       // Test implementation
     });
   });
   ```

7. **Run tests and checks**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

8. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

## Code Style Guide

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ Bad
function getUser(id: any): any {
  return prisma.user.findUnique({ where: { id } });
}
```

### React Components

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return <button className={cn(styles[variant])} onClick={onClick}>
    {children}
  </button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### API Procedures

```typescript
// ✅ Good
export const clientRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: input,
      });
    }),
});

// ❌ Bad
export const clientRouter = router({
  create: protectedProcedure
    .mutation(async ({ ctx, input }: any) => {
      return ctx.prisma.client.create({ data: input });
    }),
});
```

## Testing

### Unit Tests

```typescript
// packages/api/__tests__/client.router.test.ts
import { describe, it, expect } from '@jest/globals';
import { clientRouter } from '../routers/client';

describe('Client Router', () => {
  it('should create client', async () => {
    const mockContext = {
      prisma: {
        client: {
          create: jest.fn().mockResolvedValue({
            id: '1',
            name: 'Test Client',
          }),
        },
      },
      session: { user: { id: '1', role: 'ADMIN' } },
    };

    const caller = clientRouter.createCaller(mockContext as any);
    const result = await caller.create({
      name: 'Test Client',
      email: 'test@example.com',
    });

    expect(result.id).toBe('1');
    expect(mockContext.prisma.client.create).toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
// apps/web/e2e/client.spec.ts
import { test, expect } from '@playwright/test';

test('should create new client', async ({ page }) => {
  await page.goto('/clients');
  await page.click('button:has-text("New Client")');

  await page.fill('input[name="name"]', 'Test Client');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Test Client')).toBeVisible();
});
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Database Migrations

### Creating Migrations

```bash
# After editing schema.prisma
pnpm db:migrate:dev --name descriptive_name

# Examples:
pnpm db:migrate:dev --name add_user_avatar
pnpm db:migrate:dev --name create_invoices_table
```

### Applying Migrations

```bash
# Development
pnpm db:migrate:dev

# Production
pnpm db:migrate:deploy

# Reset (⚠️ deletes all data)
pnpm db:migrate:reset
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/biolab"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="min-32-character-secret"

# Redis (optional but recommended)
REDIS_URL="redis://localhost:6379"
```

### Optional Variables

```env
# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email
RESEND_API_KEY=""

# Storage
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Monitoring
SENTRY_DSN=""
LOG_LEVEL="debug"
```

## Debugging

### VS Code Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Debug Logging

```typescript
import { logger } from '@biolab/api/middleware/logger';

// Debug log
logger.debug('Processing client', { clientId: '123' });

// With error
logger.error('Failed to process', { error: err.message });
```

## Performance Optimization

### Database Query Optimization

```typescript
// ✅ Good: Include related data in one query
const clients = await prisma.client.findMany({
  include: {
    consultant: true,
    _count: {
      select: { documents: true },
    },
  },
});

// ❌ Bad: N+1 queries
const clients = await prisma.client.findMany();
for (const client of clients) {
  const consultant = await prisma.user.findUnique({
    where: { id: client.consultantId },
  });
}
```

### React Performance

```typescript
// ✅ Good: Memoization
const MemoizedComponent = React.memo(function Component({ data }) {
  return <div>{data.name}</div>;
});

// ✅ Good: useMemo for expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);

// ✅ Good: useCallback for functions
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

## Troubleshooting

### Common Issues

**Prisma Client not found**
```bash
pnpm db:generate
```

**Port 3000 already in use**
```bash
lsof -ti:3000 | xargs kill
# Or change port in package.json
```

**Database connection errors**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

**Type errors after schema changes**
```bash
pnpm db:generate
pnpm type-check
```

## Best Practices

### DO ✅

- Write TypeScript with strict types
- Add JSDoc comments for public APIs
- Write tests for new features
- Use meaningful commit messages
- Keep functions small and focused
- Use proper error handling
- Validate all inputs
- Log important operations
- Cache frequently accessed data
- Follow existing patterns

### DON'T ❌

- Use `any` type
- Skip error handling
- Commit commented code
- Push `.env` files
- Hardcode secrets
- Skip tests
- Use `console.log` (use logger)
- Ignore TypeScript errors
- Mix concerns
- Copy-paste code

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
