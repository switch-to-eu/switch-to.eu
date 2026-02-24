#!/usr/bin/env node

// @ts-check
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

console.log("🔄 Connecting to database...");

// Create a postgres client for migrations (max 1 connection)
const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

console.log("🔄 Running migrations...");

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations completed successfully");
  await sql.end();
  process.exit(0);
} catch (error) {
  console.error("❌ Migration failed:", error);
  await sql.end();
  process.exit(1);
}
