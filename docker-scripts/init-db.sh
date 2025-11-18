#!/bin/sh
# Database initialization script

set -e

echo "🔄 Running database migrations..."
pnpm db:migrate:deploy

echo "🌱 Seeding database..."
pnpm db:seed

echo "✅ Database initialized successfully!"
