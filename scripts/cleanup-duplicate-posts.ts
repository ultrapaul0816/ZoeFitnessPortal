import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Find duplicates: same user_id, same content, within 1 minute of each other
    const dupes = await pool.query(`
      WITH ranked AS (
        SELECT 
          id, user_id, content, created_at,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, content 
            ORDER BY created_at ASC
          ) as rn,
          COUNT(*) OVER (
            PARTITION BY user_id, content
          ) as cnt,
          LAG(created_at) OVER (
            PARTITION BY user_id, content 
            ORDER BY created_at ASC
          ) as prev_created_at
        FROM community_posts
      )
      SELECT id, user_id, content, created_at, rn, prev_created_at
      FROM ranked
      WHERE cnt > 1 AND rn > 1
        AND created_at - prev_created_at < INTERVAL '1 minute'
      ORDER BY user_id, content, created_at
    `);

    if (dupes.rows.length === 0) {
      console.log("✅ No duplicate community posts found.");
      return;
    }

    console.log(`Found ${dupes.rows.length} duplicate post(s) to remove:\n`);
    for (const row of dupes.rows) {
      const preview = (row.content || "").substring(0, 80).replace(/\n/g, " ");
      console.log(`  ID: ${row.id} | user: ${row.user_id} | "${preview}..." | ${row.created_at}`);
    }

    const idsToDelete = dupes.rows.map((r) => r.id);
    console.log(`\nDeleting ${idsToDelete.length} duplicate(s)...`);

    const result = await pool.query(
      `DELETE FROM community_posts WHERE id = ANY($1)`,
      [idsToDelete]
    );
    console.log(`✅ Deleted ${result.rowCount} duplicate post(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
