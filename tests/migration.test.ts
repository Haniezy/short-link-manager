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
