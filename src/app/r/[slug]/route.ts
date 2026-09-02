import { notFound } from "next/navigation";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getLinkBySlug, recordClick } from "@/lib/db/queries";

/**
 * Public redirect endpoint. Anyone can hit /r/[slug]; it is not authenticated.
 * On a hit we record a click, invalidate the cached link/dashboard data so the
 * UI updates without a manual reload, then issue a 307 (temporary) redirect.
 *
 * We also emit `Cache-Control: no-store` so browsers don't serve the redirect
 * from their HTTP cache without re-hitting this route (which would skip the
 * recordClick insert and make the click counter never advance).
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
  revalidateTag(`link:${link.id}`, "max");
  revalidateTag("links", "max");

  const response = NextResponse.redirect(link.destinationUrl, 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
