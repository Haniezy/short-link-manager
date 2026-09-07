import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guard";
import { getLinksByUser } from "@/lib/db/queries";
import { LinkCard } from "@/components/link-card";
import { EmptyLinks } from "@/components/empty-links";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await requireSession();
  const links = await getLinksByUser(session.user.id);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("meta", { count: links.length })}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="h-4 w-4" />
            {t("newLink")}
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
