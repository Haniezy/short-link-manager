import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { createAuthServer, resolveNeonAuthLogging } from "@neondatabase/auth/server";
import { authRequestContext } from "./request-context";
import { z } from "zod";

const authConfigSchema = z.object({
  baseUrl: z.url().refine((value) => new URL(value).protocol === "https:"),
  secret: z.string().min(32),
});
let auth: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  if (auth) return auth;
  const config = authConfigSchema.safeParse({
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  });
  if (!config.success) throw new Error("Neon Auth is not configured.");
  auth = createNeonAuth({
    baseUrl: config.data.baseUrl,
    cookies: { secret: config.data.secret, sessionDataTtl: 60 },
    logLevel: "silent",
  });
  // Retain Next's middleware/handler while using fresh per-request cookies for SDK calls.
  Object.assign(auth, createAuthServer({
    baseUrl: config.data.baseUrl,
    cookieSecret: config.data.secret,
    sessionDataTtl: 60,
    context: authRequestContext,
    log: resolveNeonAuthLogging({ logLevel: "silent" }),
  }));
  return auth;
}
