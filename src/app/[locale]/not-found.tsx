import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound({ params }: { params?: Promise<{ locale: string }> }) {
  const { locale } = (await params) ?? { locale: "en" };
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("desc")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          {t("home")}
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
          {t("dashboard")}
        </Link>
      </div>
    </div>
  );
}
