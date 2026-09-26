import "server-only";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./index";
import { avatars } from "./schema";
import { userIdSchema, linkIdSchema } from "../validation";

export async function getAvatarUrl(userId: string): Promise<string | null | undefined> {
  userIdSchema.parse(userId);
  const [row] = await db.select({ id: avatars.id, present: sql<boolean>`${avatars.webp} is not null` }).from(avatars).where(eq(avatars.userId, userId)).limit(1);
  return row ? (row.present ? `/avatars/${row.id}` : null) : undefined;
}
export async function saveAvatar(userId: string, webp: Buffer | null) {
  userIdSchema.parse(userId);
  const value = { userId, id: randomUUID(), webp: webp?.toString("base64") ?? null };
  await db.insert(avatars).values(value).onConflictDoUpdate({ target: avatars.userId, set: { id: value.id, webp: value.webp } });
  return webp ? `/avatars/${value.id}` : null;
}
export async function readAvatar(id: string) {
  if (!linkIdSchema.safeParse(id).success) return null;
  const [row] = await db.select({ webp: avatars.webp }).from(avatars).where(eq(avatars.id, id)).limit(1);
  return row?.webp ? Buffer.from(row.webp, "base64") : null;
}
