import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Column names are spelled out in snake_case so the SQL in migrations
// matches the database exactly, without relying on a casing transform.

export const households = pgTable(
  "households",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Safety net for the Zod validation in the app layer.
    check("households_name_length", sql`char_length(${table.name}) between 1 and 100`),
  ],
);
