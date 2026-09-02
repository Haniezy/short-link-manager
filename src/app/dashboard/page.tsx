import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/guard";
import { getLinksByUser } from "@/lib/db/queries";
import { LinkCard } from "@/components/link-card";
import { EmptyLinks } from "@/components/empty-links";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await requireSession();
  const links = await getLinksByUser(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your links</h1>
          <p className="text-sm text-muted-foreground">
            {links.length} {links.length === 1 ? "link" : "links"} · click any
            link to see details.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="h-4 w-4" />
            New link
          </Button>
        </Link>
      </div>

      {links.length === 0 ? (
        <EmptyLinks />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
