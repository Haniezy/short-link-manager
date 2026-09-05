import { notFound } from "next/navigation";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getLinkBySlug, recordClick } from "@/lib/db/queries";

// Cache tags are declared inline below so the redirect route and the actions
// agree on the same keys. `link:<id>` covers the per-link detail query
// (getLinkById/getClicksPerDay), `links` covers the user-wide dashboard list
// (getLinksByUser). Invalidate both after a click so either page reflects the
// new count when the user navigates back.

/**
 * Public redirect endpoint. Anyone can hit /r/[slug]; it is not authenticated.
 * On a hit we record a click, invalidate the cached link/dashboard data so the
 * UI updates without a manual reload, then issue a 303 redirect.
 *
 * 303 (See Other) is deliberate: browsers are explicitly allowed to cache 307
 * responses, which would replay the redirect from disk without re-running this
 * handler — silently skipping recordClick and freezing the click counter. 303
 * plus a `no-store` Cache-Control makes the browser re-hit this route every
 * time, so every visit is counted exactly once.
 *
 * Cache invalidation runs in `after()` so the redirect can flush to the wire
 * before we do extra cache work; the user's browser is already on the way to
 * the destination by the time revalidateTag runs.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link) {
    notFound();
  }

  await recordClick(link.id);

  after(() => {
    revalidateTag(`link:${link.id}`, "max");
    revalidateTag("links", "max");
  });

  const response = NextResponse.redirect(link.destinationUrl, 303);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}