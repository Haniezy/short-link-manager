import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { clicks, links } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { slug } = await context.params;

  const destinationUrl = await db.transaction(async (tx) => {
    const [link] = await tx
      .update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.slug, slug))
      .returning({
        id: links.id,
        destinationUrl: links.destinationUrl,
      });

    if (!link) {
      return null;
    }

    await tx.insert(clicks).values({ linkId: link.id });

    return link.destinationUrl;
  });

  if (!destinationUrl) {
    notFound();
  }

  return NextResponse.redirect(destinationUrl, 307);
}