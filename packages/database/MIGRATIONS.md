# Database Migrations Guide

This project uses Prisma Migrate for version-controlled database schema management.

## Commands

### Development
```bash
# Create and apply a new migration
pnpm db:migrate:dev

# Generate Prisma Client after schema changes
pnpm db:generate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Production
```bash
# Apply pending migrations (CI/CD)
pnpm db:migrate:deploy

# Generate Prisma Client
pnpm db:generate
```

### Other
```bash
# Reset database (WARNING: destroys all data)
pnpm db:migrate:reset

# Legacy: Push schema without migrations (not recommended for production)
pnpm db:push
```

## Workflow

### Making Schema Changes

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm db:migrate:dev --name descriptive_name`
3. Review the generated migration in `packages/database/prisma/migrations/`
4. Test thoroughly
5. Commit both schema.prisma AND migrations folder

### Deployment

Migrations are automatically applied in CI/CD via:
```bash
pnpm db:migrate:deploy
```

## Migration Naming

Use descriptive names:
- ✅ `add_user_avatar_field`
- ✅ `create_invoices_table`
- ✅ `add_client_status_index`
- ❌ `update`
- ❌ `fix`

## Best Practices

1. **Never edit existing migrations** - create new ones instead
2. **Always test migrations** on a copy of production data before deploying
3. **Use transactions** - Prisma does this by default
4. **Backup production** before running migrations
5. **Review SQL** in generated migrations before committing

## Rollback Strategy

Prisma doesn't support automatic rollbacks. To rollback:

1. Create a new migration that reverses the changes
2. Or restore from database backup
3. Consider using `pnpm db:migrate:reset` in dev only

## Troubleshooting

### Migration fails
```bash
# Check migration status
cd packages/database
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration-name>
```

### Out of sync
```bash
# Generate new client
pnpm db:generate

# If needed, reset dev database
pnpm db:migrate:reset
```
