import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Environment variable DATABASE_URL is missing.");
  }

  const sql = neon(connectionString);
  const database = drizzle(sql);

  await migrate(database, { migrationsFolder: "./drizzle" });

  console.log("Migrations applied successfully.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});