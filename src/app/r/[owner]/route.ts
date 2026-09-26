import { NextResponse } from "next/server";
import { resolveLink } from "@/lib/db/queries";
import { httpError } from "@/lib/http-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type RouteContext = { params: Promise<{ owner: string }> };

async function respond(context: RouteContext, head: boolean): Promise<Response> {
  try {
    const { owner: slug } = await context.params;
    const destination = await resolveLink(slug, !head);
    if (!destination) return httpError(404, head);
    return NextResponse.redirect(destination, { status: 307, headers: { "Cache-Control": "no-store" } });
  } catch {
    return httpError(503, head);
  }
}
export async function GET(_request: Request, context: RouteContext) { return respond(context, false); }
export async function HEAD(_request: Request, context: RouteContext) { return respond(context, true); }
