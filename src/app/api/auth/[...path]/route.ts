import { NextResponse } from "next/server";

/**
 * Auth endpoint stub for the local (no Neon) build.
 *
 * With Neon Auth, this file exposed the Neon Auth callback handler. The local
 * provider stores sessions in a signed httpOnly cookie and performs sign-up /
 * sign-in / sign-out through Server Actions (see src/lib/actions/auth.ts), so
 * this route is no longer needed. It returns 404 to avoid leaking a dead
 * endpoint.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
