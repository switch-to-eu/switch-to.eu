// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `plotty_${name}`);

// Polls table - stores encrypted poll data for privacy
export const polls = createTable(
  "polls",
  (t) => ({
    // Short, user-friendly poll ID (10 characters)
    id: t.varchar({ length: 10 }).primaryKey(),

    // Admin access token for poll management (64 characters)
    adminToken: t.varchar("admin_token", { length: 64 }).notNull().unique(),

    // Client-side encrypted poll data (participants, options, votes)
    encryptedData: t.text("encrypted_data"),

    // Timestamps
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),

    // Soft delete functionality
    isDeleted: t.boolean("is_deleted").default(false).notNull(),

    deletedAt: t.timestamp("deleted_at", { withTimezone: true }),
  }),
  (table) => [
    // Performance indexes
    index("idx_polls_expires_at").on(table.expiresAt),
    index("idx_polls_created_at").on(table.createdAt),
    index("idx_polls_admin_token").on(table.adminToken),
  ],
);

// Type exports for use in tRPC and other parts of the application
export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
