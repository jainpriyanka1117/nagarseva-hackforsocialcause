import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbUrl = process.env["DATABASE_URL"] ?? "file:local.db";

export const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  // Create tables if they do not exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'citizen',
      ward TEXT DEFAULT 'Ward 82',
      department TEXT,
      phone TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      ward TEXT NOT NULL DEFAULT 'Ward 82',
      status TEXT NOT NULL DEFAULT 'Submitted',
      priority TEXT NOT NULL DEFAULT 'Medium',
      description TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      safety INTEGER DEFAULT 0,
      sla_deadline TEXT,
      sla_remaining TEXT,
      citizen_id TEXT,
      citizen_name TEXT DEFAULT 'Local Citizen',
      citizen_phone TEXT,
      assigned_officer_id TEXT,
      assigned_officer_name TEXT,
      resolved_at TEXT,
      verified_at TEXT,
      resolution_proof TEXT,
      verification_feedback TEXT,
      reopen_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  try {
    await client.execute(`ALTER TABLE complaints ADD COLUMN reopen_reason TEXT;`);
  } catch {
    // Column already exists
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS complaint_timeline (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS complaint_evidence (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      file_url TEXT NOT NULL,
      caption TEXT,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Auto seed initial data if table is empty
  const countRes = await client.execute("SELECT COUNT(*) as count FROM complaints");
  const count = Number(countRes.rows[0]?.["count"] ?? 0);
  if (count === 0) {
    const { seedDatabase } = await import("./seed");
    await seedDatabase();
  }

  isInitialized = true;
}
