import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Local auth users (replaces Neon Auth). Passwords are stored hashed (bcrypt).
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  }),
);

/**
 * Short links owned by a user.
 *
 * `slug` is globally unique (not per-user) because the public redirect route
 * `/r/[slug]` has no concept of the requesting user — per-user uniqueness
 * would make the redirect ambiguous. See README "Decisions I made".
 */
export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    slug: text("slug").notNull().unique(),
    title: text("title"),
    destinationUrl: text("destination_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index("links_slug_idx").on(table.slug),
    userIdIdx: index("links_user_id_idx").on(table.userId),
  }),
);

/**
 * One row per recorded click. The total click count is derived from this
 * table (no redundant counter column) so the count and the 7-day chart are
 * always consistent. Deleting a link cascades to its clicks.
 */
export const clicks = pgTable(
  "clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clickedAt: timestamp("clicked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    linkIdIdx: index("clicks_link_id_idx").on(table.linkId),
    clickedAtIdx: index("clicks_clicked_at_idx").on(table.clickedAt),
  }),
);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
