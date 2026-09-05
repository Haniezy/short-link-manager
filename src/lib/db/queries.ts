import { and, count, desc, eq, gte, sql, type InferSelectModel } from "drizzle-orm";
import { getDb } from "./client";
import { ensureSchema } from "./migrate";
import { clicks, links, users, type Link } from "./schema";

type LinkRow = InferSelectModel<typeof links>;

export type LinkWithClicks = Link & { clickCount: number };

/**
 * All database access lives here. UI/server actions call these functions and
 * never touch `db` directly, keeping a clean separation of concerns. Every
 * function ensures the schema exists (idempotent) before querying, so no
 * external migration step is required.
 */
async function ready() {
  await ensureSchema();
  return getDb();
}

export async function getLinksByUser(userId: string): Promise<LinkWithClicks[]> {
  const database = await ready();
  const rows = await database
    .select({
      link: links,
      clickCount: count(clicks.id).as("click_count"),
    })
    .from(links)
    .leftJoin(clicks, eq(clicks.linkId, links.id))
    .where(eq(links.userId, userId))
    .groupBy(links.id)
    .orderBy(desc(links.createdAt));

  return rows.map((row: { link: LinkRow; clickCount: string | number }) => ({ ...row.link, clickCount: Number(row.clickCount) }));
}

export async function getLinkById(
  id: string,
  userId: string,
): Promise<LinkWithClicks | null> {
  const database = await ready();
  const [row] = await database
    .select({
      link: links,
      clickCount: count(clicks.id).as("click_count"),
    })
    .from(links)
    .leftJoin(clicks, eq(clicks.linkId, links.id))
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .groupBy(links.id)
    .limit(1);

  if (!row) return null;
  return { ...row.link, clickCount: Number(row.clickCount) };
}

export async function getLinkBySlug(slug: string): Promise<Link | null> {
  const database = await ready();
  const [link] = await database
    .select()
    .from(links)
    .where(eq(links.slug, slug))
    .limit(1);
  return link ?? null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const database = await ready();
  const [row] = await database
    .select({ id: links.id })
    .from(links)
    .where(eq(links.slug, slug))
    .limit(1);
  return Boolean(row);
}

export type InsertLink = {
  userId: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
};

export async function insertLink(input: InsertLink): Promise<Link> {
  const database = await ready();
  const [link] = await database.insert(links).values(input).returning();
  return link;
}

export async function deleteLinkById(id: string, userId: string): Promise<boolean> {
  const database = await ready();
  const deleted = await database
    .delete(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .returning();
  return (deleted as unknown as Array<Record<string, unknown>>).length > 0;
}

export async function recordClick(linkId: string): Promise<void> {
  const database = await ready();
  await database.insert(clicks).values({ linkId });
}

export type DailyClicks = { date: string; clicks: number };

/**
 * Click counts per day for the last `days` days (inclusive of today),
 * bucketed by calendar day in UTC. Days with zero clicks are filled in so the
 * chart always shows a continuous series.
 */
export async function getClicksPerDay(
  linkId: string,
  days = 7,
): Promise<DailyClicks[]> {
  const database = await ready();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const rows = await database
    .select({
      day: sql<string>`to_char(${clicks.clickedAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
      clicks: count(clicks.id).as("clicks"),
    })
    .from(clicks)
    .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, since)))
    .groupBy(sql`to_char(${clicks.clickedAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`);

  const byDay = new Map(rows.map((r: { day: string; clicks: string | number }) => [r.day, Number(r.clicks)]));
  const series: DailyClicks[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, clicks: byDay.get(key) ?? 0 });
  }
  return series;
}

export async function getUserByEmail(email: string) {
  const database = await ready();
  const [user] = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function insertUser(input: {
  email: string;
  passwordHash: string;
}) {
  const database = await ready();
  const [user] = await database.insert(users).values(input).returning();
  return user;
}
