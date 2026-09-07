import { requireSession } from "@/lib/auth/guard";
import { LinkForm } from "@/components/link-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewLinkPage() {
  await requireSession();
  const t = await getTranslations("linkForm");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("detailsTitle")}</CardTitle>
          <CardDescription>{t("detailsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm />
        </CardContent>
      </Card>
    </div>
  );
}
