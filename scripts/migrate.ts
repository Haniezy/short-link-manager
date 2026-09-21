import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

config({ path: ".env.local" });

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Environment variable DATABASE_URL is missing.");
  }

  const pool = new Pool({ connectionString });
  const database = drizzle(pool);

  await migrate(database, { migrationsFolder: "./drizzle" });

  await pool.end();

  console.log("Migrations applied successfully.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});