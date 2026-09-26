import "server-only";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "./index";
import { clicks, links, type Link } from "./schema";
import { linkIdSchema, slugSchema, userIdSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/slug";

export async function getLinksForUser(userId: string): Promise<Link[]> {
  userIdSchema.parse(userId);
  return db.select().from(links).where(eq(links.userId, userId)).orderBy(desc(links.createdAt));
}
export async function getLinkForUser(id: string, userId: string): Promise<Link | null> {
  userIdSchema.parse(userId);
  if (!linkIdSchema.safeParse(id).success) return null;
  const [link] = await db.select().from(links)
    .where(and(eq(links.id, id), eq(links.userId, userId))).limit(1);
  return link ?? null;
}
export async function insertLinkForUser(userId: string, input: {
  longUrl: string; customSlug: string | null; title: string | null;
}): Promise<Link | null> {
  userIdSchema.parse(userId);
  for (let attempt = 0; attempt < 4; attempt++) {
    const [link] = await db.insert(links).values({
      userId, slug: input.customSlug ?? generateSlug(),
      destinationUrl: input.longUrl, title: input.title,
    }).onConflictDoNothing({ target: [links.userId, links.slug] }).returning();
    if (link) return link;
    if (input.customSlug) return null;
  }
  return null;
}
export async function deleteLinkForUser(id: string, userId: string): Promise<boolean> {
  linkIdSchema.parse(id);
  userIdSchema.parse(userId);
  const deleted = await db.delete(links)
    .where(and(eq(links.id, id), eq(links.userId, userId))).returning({ id: links.id });
  return deleted.length > 0;
}
export async function resolveLink(slug: string, recordClick: boolean, userId?: string): Promise<string | null> {
  if (!slugSchema.safeParse(slug).success || (userId !== undefined && !userIdSchema.safeParse(userId).success)) return null;
  const match = userId === undefined ? eq(links.legacySlug, slug) : and(eq(links.userId, userId), eq(links.slug, slug));
  if (!recordClick) {
    const [link] = await db.select({ destination: links.destinationUrl }).from(links)
      .where(match).limit(1);
    return link?.destination ?? null;
  }
  return db.transaction(async (tx) => {
    const [link] = await tx.update(links).set({ clicks: sql`${links.clicks} + 1` })
      .where(match).returning({ id: links.id, destination: links.destinationUrl });
    if (!link) return null;
    await tx.insert(clicks).values({ linkId: link.id });
    return link.destination;
  });
}
export type ClickCountByDay = { day: string; count: number };
export async function getClicksByDay(linkId: string, userId: string): Promise<ClickCountByDay[]> {
  linkIdSchema.parse(linkId);
  userIdSchema.parse(userId);
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = new Date(midnight - 6 * 86_400_000);
  const end = new Date(midnight + 86_400_000);
  const day = sql<string>`to_char(${clicks.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`;
  const rows = await db.select({ day, count: sql<number>`count(*)::int` })
    .from(clicks).innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(eq(clicks.linkId, linkId), eq(links.userId, userId),
      gte(clicks.createdAt, start), lt(clicks.createdAt, end)))
    .groupBy(day).orderBy(day);
  const counts = new Map(rows.map((row) => [row.day, Number(row.count)]));
  return Array.from({ length: 7 }, (_, index) => {
    const key = new Date(start.getTime() + index * 86_400_000).toISOString().slice(0, 10);
    return { day: key, count: counts.get(key) ?? 0 };
  });
}

export async function getDashboardForUser(userId: string, requestedPage: number) {
  userIdSchema.parse(userId);
  const [totals] = await db.select({ total: sql<number>`count(*)::int`, totalClicks: sql<number>`coalesce(sum(${links.clicks}), 0)::float8` }).from(links).where(eq(links.userId, userId));
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(totals.total / pageSize));
  const page = Math.min(requestedPage, pages);
  const items = await db.select().from(links).where(eq(links.userId, userId)).orderBy(desc(links.createdAt), desc(links.id)).limit(pageSize).offset((page - 1) * pageSize);
  return { links: items, total: totals.total, totalClicks: totals.totalClicks, page, pages };
}
