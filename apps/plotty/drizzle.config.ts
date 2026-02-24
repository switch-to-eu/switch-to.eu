import { type Config } from "drizzle-kit";

// Simple env configuration for migrations (no external dependencies)
const env = {
  DATABASE_URL: process.env.DATABASE_URL,
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default {
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["plotty_*"],
} satisfies Config;
