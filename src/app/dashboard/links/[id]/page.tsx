import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { requireSession } from "@/lib/auth/guard";
import { getClicksPerDay, getLinkById } from "@/lib/db/queries";
import { shortUrl } from "@/lib/config";
import { ClicksChart } from "@/components/clicks-chart";
import { DeleteLinkButton } from "@/components/delete-link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const link = await getLinkById(id, session.user.id);
  if (!link) notFound();

  const daily = await getClicksPerDay(link.id, 7);
  const created = new Date(link.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to links
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-mono text-xl font-bold">/r/{link.slug}</h1>
          {link.title ? (
            <p className="text-muted-foreground">{link.title}</p>
          ) : null}
        </div>
        <DeleteLinkButton linkId={link.id} slug={link.slug} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total clicks
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{link.clickCount}</CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 break-all text-sm hover:underline"
            >
              {link.destinationUrl}
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              Created {created} · Short URL:{" "}
              <span className="font-mono">{shortUrl(link.slug)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clicks per day (last 7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksChart data={daily} />
        </CardContent>
      </Card>
    </div>
  );
}
