import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { migrate } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import { client, db } from "./database";
import { links, clicks } from "../src/lib/db/schema";
import { createLinkSchema } from "../src/lib/validation";

vi.mock("../src/lib/db/index", async () => import("./database"));
const session = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("../src/lib/auth/session", () => session);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createLinkAction, deleteLinkAction } from "../src/actions/links";
import { getClicksByDay, getLinkForUser, getLinksForUser, resolveLink } from "../src/lib/db/queries";
import { GET, HEAD } from "../src/app/r/[slug]/route";
import { loadDashboard, loadLinkDetails } from "../src/lib/links";
import * as slugModule from "../src/lib/slug";

const alice = { id: "neon-alice", email: "alice@example.com" };
const bob = { id: "neon-bob", email: "bob@example.com" };
const request = new Request("https://short.example/r/test");
const context = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeAll(async () => { await migrate(db, { migrationsFolder: "./drizzle" }); });
beforeEach(async () => {
  await db.delete(links);
  session.getCurrentUser.mockReset().mockResolvedValue(alice);
});
afterAll(async () => { await client.close(); });

async function create(slug = "test") {
  const result = await createLinkAction({ longUrl: "https://example.com/path?q=1", customSlug: slug });
  expect(result.error).toBeNull();
  if (!result.data) throw new Error("Expected a link");
  return result.data.link;
}

describe("input and authorization", () => {
  it.each(["javascript:alert(1)", "ftp://example.com", "/relative", "garbage", "", "https://"])(
    "rejects unsafe or invalid destination %s without throwing", async (longUrl) => {
      const result = await createLinkAction({ longUrl });
      expect(result.error).toBeTruthy();
      expect(result.fieldErrors?.longUrl).toBeDefined();
      expect(await db.select().from(links)).toHaveLength(0);
    });
  it("accepts omitted optional inputs and rejects nulls/invalid slugs", () => {
    expect(createLinkSchema.safeParse({ longUrl: "https://example.com" }).success).toBe(true);
    for (const customSlug of ["a/b", "a b", "x".repeat(33), null]) {
      expect(createLinkSchema.safeParse({ longUrl: "https://example.com", customSlug }).success).toBe(false);
    }
  });
  it("requires a verified user", async () => {
    session.getCurrentUser.mockResolvedValue(null);
    expect((await createLinkAction({ longUrl: "https://example.com" })).error).toContain("signed in");
    expect(await db.select().from(links)).toHaveLength(0);
  });
  it("does not leak session provider errors", async () => {
    session.getCurrentUser.mockRejectedValue(new Error("SECRET_DATABASE_PASSWORD"));
    expect(await createLinkAction({ longUrl: "https://example.com" })).toEqual({
      data: null, error: "Could not create the link. Please try again.",
    });
    expect(await deleteLinkAction({ id: "123e4567-e89b-42d3-a456-426614174000" })).toEqual({
      data: null, error: "Could not delete the link. Please try again.",
    });
  });
  it("validates malformed ids before querying PostgreSQL", async () => {
    expect((await deleteLinkAction({ id: "not-a-uuid" })).fieldErrors?.id).toBeDefined();
    expect(await getLinkForUser("not-a-uuid", alice.id)).toBeNull();
  });
  it("uses the session owner, never the submitted owner", async () => {
    const result = await createLinkAction({ longUrl: "https://example.com", userId: bob.id });
    expect(result.data?.link.userId).toBe(alice.id);
  });
});

describe("link ownership and collisions", () => {
  it("retries a random collision without overwriting the existing link", async () => {
    await create("taken1");
    const generator = vi.spyOn(slugModule, "generateSlug")
      .mockReturnValueOnce("taken1").mockReturnValueOnce("fresh1");
    try {
      const result = await createLinkAction({ longUrl: "https://example.org" });
      expect(result.data?.link.slug).toBe("fresh1");
      expect(generator).toHaveBeenCalledTimes(2);
    } finally { generator.mockRestore(); }
  });
  it("returns a bounded error after four random collisions", async () => {
    await create("taken1");
    const generator = vi.spyOn(slugModule, "generateSlug").mockReturnValue("taken1");
    try {
      expect((await createLinkAction({ longUrl: "https://example.org" })).error).toContain("unique slug");
      expect(generator).toHaveBeenCalledTimes(4);
    } finally { generator.mockRestore(); }
  });
  it("provides safe dashboard and detail results without exposing other users' data", async () => {
    const link = await create();
    expect((await loadDashboard()).data?.links).toHaveLength(1);
    expect((await loadLinkDetails(link.id)).data?.clicksByDay).toHaveLength(7);
    session.getCurrentUser.mockResolvedValue(bob);
    expect(await loadLinkDetails(link.id)).toEqual({ data: null, error: "Link not found." });
    session.getCurrentUser.mockRejectedValue(new Error("PRIVATE_ERROR"));
    expect((await loadDashboard()).error).toBe("Could not load your links. Please try again.");
    expect((await loadLinkDetails(link.id)).error).toBe("Could not load this link. Please try again.");
  });
  it("generates six alphanumeric characters when optional inputs are omitted", async () => {
    const result = await createLinkAction({ longUrl: "https://example.com" });
    expect(result.data?.link.slug).toMatch(/^[a-zA-Z0-9]{6}$/);
    expect(result.data?.link.title).toBeNull();
  });
  it("reports duplicate custom slugs as an inline field error across owners", async () => {
    await create();
    session.getCurrentUser.mockResolvedValue(bob);
    const duplicate = await createLinkAction({ longUrl: "https://example.org", customSlug: "test" });
    expect(duplicate.fieldErrors?.customSlug).toEqual(["Slug already taken."]);
    expect(await db.select().from(links)).toHaveLength(1);
  });
  it("isolates list, detail, statistics and deletion between users", async () => {
    const link = await create();
    await resolveLink("test", true);
    expect(await getLinksForUser(bob.id)).toEqual([]);
    expect(await getLinkForUser(link.id, bob.id)).toBeNull();
    expect((await getClicksByDay(link.id, bob.id)).every((day) => day.count === 0)).toBe(true);
    session.getCurrentUser.mockResolvedValue(bob);
    expect((await deleteLinkAction({ id: link.id })).error).toBe("Link not found.");
    expect(await getLinkForUser(link.id, alice.id)).not.toBeNull();
  });
  it("deletes a user's own link and cascades click records", async () => {
    const link = await create();
    await resolveLink("test", true);
    expect(await deleteLinkAction({ id: link.id })).toEqual({ data: null, error: null });
    expect(await db.select().from(clicks)).toEqual([]);
    expect(await resolveLink("test", false)).toBeNull();
  });
});

describe("redirect and analytics", () => {
  it("redirects with 307, disables caching and records one click", async () => {
    const link = await create();
    const response = await GET(request, context("test"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/path?q=1");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await getLinkForUser(link.id, alice.id))?.clicks).toBe(1);
    expect(await db.select().from(clicks)).toHaveLength(1);
  });
  it("does not count HEAD requests", async () => {
    const link = await create();
    expect((await HEAD(request, context("test"))).status).toBe(307);
    expect((await getLinkForUser(link.id, alice.id))?.clicks).toBe(0);
    expect(await db.select().from(clicks)).toHaveLength(0);
  });
  it("returns a readable 404 for unknown or malformed slugs", async () => {
    for (const slug of ["missing", "<script>"]) {
      const response = await GET(request, context(slug));
      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain("text/html");
      expect(await response.text()).toContain("Link not found");
    }
    expect(await (await HEAD(request, context("missing"))).text()).toBe("");
  });
  it("keeps the total and event log equal across concurrent requests", async () => {
    const link = await create();
    await Promise.all(Array.from({ length: 12 }, () => resolveLink("test", true)));
    expect((await getLinkForUser(link.id, alice.id))?.clicks).toBe(12);
    expect(await db.select().from(clicks)).toHaveLength(12);
  });
  it("rolls back the counter if insertion of a click fails", async () => {
    const link = await create();
    await db.execute(sql`ALTER TABLE clicks ADD CONSTRAINT test_reject_click CHECK (false)`);
    try {
      const response = await GET(request, context("test"));
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain("test_reject_click");
      expect((await getLinkForUser(link.id, alice.id))?.clicks).toBe(0);
    } finally {
      await db.execute(sql`ALTER TABLE clicks DROP CONSTRAINT test_reject_click`);
    }
  });
  it("returns exactly seven UTC dates, fills zeros and excludes outside dates", async () => {
    const link = await create();
    const now = new Date();
    const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const first = midnight - 6 * 86_400_000;
    await db.insert(clicks).values([
      { linkId: link.id, createdAt: new Date(first - 1) },
      { linkId: link.id, createdAt: new Date(first) },
      { linkId: link.id, createdAt: new Date(midnight) },
      { linkId: link.id, createdAt: new Date(midnight + 86_400_000) },
    ]);
    await db.execute(sql`SET TIME ZONE 'Pacific/Honolulu'`);
    try {
      const rows = await getClicksByDay(link.id, alice.id);
      expect(rows).toHaveLength(7);
      expect(rows[0]).toEqual({ day: new Date(first).toISOString().slice(0, 10), count: 1 });
      expect(rows[6].count).toBe(1);
      expect(rows.slice(1, 6).every((day) => day.count === 0)).toBe(true);
    } finally { await db.execute(sql`SET TIME ZONE 'UTC'`); }
  });
});
