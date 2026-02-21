/**
 * Local database seed script
 *
 * Creates test users and coaching clients at various statuses:
 * - admin@test.com / test123 (admin user)
 * - testclient@test.com / test123 (coaching client — active)
 * - enrolled@test.com / test123 (coaching client — enrolled)
 * - intake@test.com / test123 (coaching client — intake_complete)
 * - plangen@test.com / test123 (coaching client — plan_generating)
 *
 * Usage:
 *   npx tsx scripts/seed-local.ts
 *
 * Requires DATABASE_URL to be set (reads from .env or .env.local).
 */

import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.local.template to .env.local and configure it.");
  process.exit(1);
}

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  console.log("Connected to database. Seeding...");

  const passwordHash = await bcrypt.hash("test123", 10);

  // Helper: upsert user by email
  async function upsertUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    goals?: string[];
    postpartumWeeks?: number;
  }) {
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${data.email} LIMIT 1`
    );
    if (existing.rows.length > 0) {
      console.log(`  User ${data.email} already exists (id=${existing.rows[0].id})`);
      return existing.rows[0].id as string;
    }

    const result = await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, is_admin, terms_accepted, disclaimer_accepted, goals, postpartum_weeks, has_completed_onboarding)
      VALUES (
        ${data.email},
        ${passwordHash},
        ${data.firstName},
        ${data.lastName},
        ${data.isAdmin},
        true,
        true,
        ${data.goals ? sql`ARRAY[${sql.join(data.goals.map(g => sql`${g}`), sql`, `)}]::text[]` : sql`NULL`},
        ${data.postpartumWeeks ?? null},
        true
      )
      RETURNING id
    `);
    const id = result.rows[0].id as string;
    console.log(`  Created user ${data.email} (id=${id})`);
    return id;
  }

  // Helper: upsert coaching client
  async function upsertCoachingClient(data: {
    userId: string;
    status: string;
    coachingType?: string;
    healthNotes?: string;
  }) {
    const existing = await db.execute(
      sql`SELECT id FROM coaching_clients WHERE user_id = ${data.userId} LIMIT 1`
    );
    if (existing.rows.length > 0) {
      await db.execute(
        sql`UPDATE coaching_clients SET status = ${data.status} WHERE id = ${existing.rows[0].id}`
      );
      console.log(`  Updated coaching client for userId=${data.userId} to status=${data.status}`);
      return existing.rows[0].id as string;
    }

    const result = await db.execute(sql`
      INSERT INTO coaching_clients (user_id, status, coaching_type, health_notes, plan_duration_weeks)
      VALUES (
        ${data.userId},
        ${data.status},
        ${data.coachingType || "pregnancy_coaching"},
        ${data.healthNotes || null},
        4
      )
      RETURNING id
    `);
    const id = result.rows[0].id as string;
    console.log(`  Created coaching client (id=${id}, status=${data.status})`);
    return id;
  }

  // 1. Admin user
  console.log("\n--- Admin User ---");
  await upsertUser({
    email: "admin@test.com",
    firstName: "Admin",
    lastName: "Zoe",
    isAdmin: true,
  });

  // 2. Active coaching client
  console.log("\n--- Active Client ---");
  const activeUserId = await upsertUser({
    email: "testclient@test.com",
    firstName: "Test",
    lastName: "Client",
    isAdmin: false,
    goals: ["core-strength", "energy"],
    postpartumWeeks: 8,
  });
  await upsertCoachingClient({
    userId: activeUserId,
    status: "active",
    healthNotes: "No significant health concerns. Cleared for exercise.",
  });

  // 3. Enrolled client (just signed up, no intake form yet)
  console.log("\n--- Enrolled Client ---");
  const enrolledUserId = await upsertUser({
    email: "enrolled@test.com",
    firstName: "Enrolled",
    lastName: "Mama",
    isAdmin: false,
    goals: ["flexibility", "confidence"],
    postpartumWeeks: 4,
  });
  await upsertCoachingClient({
    userId: enrolledUserId,
    status: "enrolled",
  });

  // 4. Intake complete client
  console.log("\n--- Intake Complete Client ---");
  const intakeUserId = await upsertUser({
    email: "intake@test.com",
    firstName: "Intake",
    lastName: "Done",
    isAdmin: false,
    goals: ["core-strength", "pain-relief"],
    postpartumWeeks: 12,
  });
  await upsertCoachingClient({
    userId: intakeUserId,
    status: "intake_complete",
    healthNotes: "Mild diastasis recti. No other concerns.",
  });

  // 5. Plan generating client
  console.log("\n--- Plan Generating Client ---");
  const planGenUserId = await upsertUser({
    email: "plangen@test.com",
    firstName: "PlanGen",
    lastName: "User",
    isAdmin: false,
    goals: ["energy", "core-strength"],
    postpartumWeeks: 6,
  });
  await upsertCoachingClient({
    userId: planGenUserId,
    status: "plan_generating",
    healthNotes: "C-section recovery. Cleared by OB at 6 weeks.",
  });

  console.log("\n--- Seed complete! ---");
  console.log("Admin:    admin@test.com / test123");
  console.log("Client:   testclient@test.com / test123 (active)");
  console.log("Enrolled: enrolled@test.com / test123");
  console.log("Intake:   intake@test.com / test123 (intake_complete)");
  console.log("PlanGen:  plangen@test.com / test123 (plan_generating)");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
