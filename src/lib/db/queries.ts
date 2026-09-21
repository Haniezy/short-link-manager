import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "./index";
import { clicks, links, type Link } from "./schema";

export async function getLinksForUser(userId: string): Promise<Link[]> {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

export async function getLinkForUser(
  id: string,
  userId: string,
): Promise<Link | null> {
  const [link] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .limit(1);

  return link ?? null;
}

export type ClickCountByDay = {
  day: string;
  count: number;
};

export async function getClicksByDay(
  linkId: string,
  days = 7,
): Promise<ClickCountByDay[]> {
  const now = new Date();
  const startUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const start = new Date(startUtc - (days - 1) * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${clicks.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(clicks)
    .where(and(eq(clicks.linkId, linkId), gte(clicks.createdAt, start)))
    .groupBy(sql`date_trunc('day', ${clicks.createdAt})`)
    .orderBy(sql`date_trunc('day', ${clicks.createdAt})`);

  const countByDay = new Map(
    rows.map((row) => [row.day, Number(row.count)]),
  );

  const result: ClickCountByDay[] = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    result.push({ day: key, count: countByDay.get(key) ?? 0 });
  }

  return result;
}