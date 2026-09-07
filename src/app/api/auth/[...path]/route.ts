import { NextResponse } from "next/server";
import { neonAuthHandlers } from "@/lib/auth/neon-auth";

/**
 * Auth endpoint.
 *
 * With Neon Auth this mounts the official Neon Auth API handler, which proxies
 * auth requests (sign-in flows, session refresh, etc.) to the Neon Auth
 * instance and maintains the session cookie. When Neon Auth is not configured
 * (local mode), the local provider performs sign-up / sign-in / sign-out
 * entirely through Server Actions (see src/lib/actions/auth.ts), so this route
 * returns 404 to avoid leaking a dead endpoint.
 */

const NEON_CONFIGURED = Boolean(
  process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET,
);

type Ctx = { params: Promise<{ path: string[] }> };

export function GET(request: Request, ctx: Ctx): Promise<Response> {
  if (!NEON_CONFIGURED) {
    return Promise.resolve(
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }
  return neonAuthHandlers().GET(request, ctx);
}

export function POST(request: Request, ctx: Ctx): Promise<Response> {
  if (!NEON_CONFIGURED) {
    return Promise.resolve(
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }
  return neonAuthHandlers().POST(request, ctx);
}