import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
it("refuses to discard legacy accounts and rolls back migration changes", async () => {
  const client = new PGlite();
  try {
    await client.exec(readFileSync("drizzle/0000_youthful_blackheart.sql", "utf8"));
    await client.exec(readFileSync("drizzle/0001_worthless_purifiers.sql", "utf8"));
    await client.query("INSERT INTO users(email,password_hash) VALUES ($1,$2)", ["legacy@example.com", "test-only-hash"]);
    await expect(client.transaction(async (tx) => {
      await tx.exec(readFileSync("drizzle/0002_neon_auth_backend.sql", "utf8"));
    })).rejects.toThrow("Legacy data exists");
    const result = await client.query<{ count: number }>("SELECT count(*)::int as count FROM users");
    expect(result.rows[0].count).toBe(1);
  } finally { await client.close(); }
});
it("preserves old aliases and data while allowing the same slug for another owner", async () => {
  const client = new PGlite();
  try {
    for (const name of ["0000_youthful_blackheart", "0001_worthless_purifiers", "0002_neon_auth_backend"]) {
      await client.exec(readFileSync(`drizzle/${name}.sql`, "utf8"));
    }
    await client.query("INSERT INTO links(user_id,slug,destination_url,clicks) VALUES ('alice','shared','https://example.com',7)");
    await client.transaction(tx => tx.exec(readFileSync("drizzle/0003_cloudy_excalibur.sql", "utf8")));
    await client.query("INSERT INTO links(user_id,slug,destination_url) VALUES ('bob','shared','https://example.org')");
    const result = await client.query<{ user_id: string; legacy_slug: string | null; clicks: number }>("SELECT user_id,legacy_slug,clicks FROM links ORDER BY user_id");
    expect(result.rows).toEqual([{ user_id: "alice", legacy_slug: "shared", clicks: 7 }, { user_id: "bob", legacy_slug: null, clicks: 0 }]);
    await expect(client.query("INSERT INTO links(user_id,slug,destination_url) VALUES ('alice','shared','https://example.net')")).rejects.toThrow();
  } finally { await client.close(); }
});
