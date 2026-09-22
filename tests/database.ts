import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../src/lib/db/schema";
export const client = new PGlite();
export const db = drizzle(client, { schema });
