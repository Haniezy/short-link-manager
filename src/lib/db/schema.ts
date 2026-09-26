import { check, index, unique, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Neon Auth owns users and sessions. Only a verified session supplies userId.
export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  legacySlug: text("legacy_slug").unique(),
  destinationUrl: text("destination_url").notNull(),
  title: text("title"),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("links_user_id_idx").on(table.userId),
  unique("links_user_slug_unique").on(table.userId, table.slug),
  check("links_clicks_nonnegative", sql`${table.clicks} >= 0`),
]);

export const clicks = pgTable("clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("clicks_link_date_idx").on(table.linkId, table.createdAt)]);

export type Link = typeof links.$inferSelect;

export const avatars = pgTable("avatars", {
  userId: text("user_id").primaryKey(),
  id: uuid("id").notNull().unique(),
  webp: text("webp"),
});
