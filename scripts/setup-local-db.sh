#!/bin/bash
# Setup a local PostgreSQL database for development
#
# Prerequisites:
#   brew install postgresql@16
#   brew services start postgresql@16
#
# Usage:
#   chmod +x scripts/setup-local-db.sh
#   ./scripts/setup-local-db.sh
#
# After running this script:
#   1. Copy .env.local.template to .env (or .env.local)
#   2. Run: npx drizzle-kit push    (creates tables)
#   3. Run: npx tsx scripts/seed-local.ts  (seeds test data)

set -e

DB_NAME="zoe_fitness_local"

echo "=== Zoe Fitness Portal — Local DB Setup ==="
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
  echo "PostgreSQL not found. Install with: brew install postgresql@16"
  exit 1
fi

if ! pg_isready -q 2>/dev/null; then
  echo "PostgreSQL is not running. Start with: brew services start postgresql@16"
  exit 1
fi

# Create database if it doesn't exist
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "Database '$DB_NAME' already exists."
else
  createdb "$DB_NAME"
  echo "Created database '$DB_NAME'."
fi

echo ""
echo "Database ready! Next steps:"
echo ""
echo "  1. Copy the template:   cp .env.local.template .env"
echo "     (or add DATABASE_URL to your existing .env)"
echo ""
echo "  2. Push schema:         DATABASE_URL=postgresql://localhost:5432/$DB_NAME npx drizzle-kit push"
echo ""
echo "  3. Seed test data:      DATABASE_URL=postgresql://localhost:5432/$DB_NAME npx tsx scripts/seed-local.ts"
echo ""
echo "  4. Start dev server:    npm run dev"
echo ""
echo "Test accounts:"
echo "  Admin:  admin@test.com / test123"
echo "  Client: testclient@test.com / test123"
echo ""
