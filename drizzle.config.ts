import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Real environment variables win, so CI and production can point drizzle-kit at another branch.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
