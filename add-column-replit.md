# Safe Migration for Replit

Since the full `drizzle-kit push` wants to make destructive changes, run this SQL directly in your Replit database:

## Option 1: Via Replit Shell with psql (if available)

```bash
psql $DATABASE_URL -c "ALTER TABLE coaching_clients ADD COLUMN IF NOT EXISTS weekly_plan_outlines jsonb;"
```

## Option 2: Create and run a Node script

Create a file `migrate-safe.mjs` in your Replit project:

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function addColumn() {
  try {
    await pool.query('ALTER TABLE coaching_clients ADD COLUMN IF NOT EXISTS weekly_plan_outlines jsonb');
    console.log('✓ Column weekly_plan_outlines added successfully');
  } catch (error) {
    console.error('Error adding column:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addColumn();
```

Then run:
```bash
node migrate-safe.mjs
```

## Option 3: Via Replit Database GUI

1. Open your Replit database interface
2. Run this SQL query:
```sql
ALTER TABLE coaching_clients ADD COLUMN IF NOT EXISTS weekly_plan_outlines jsonb;
```

---

After adding the column, restart your Replit server and the new features will work!
