"use client";

import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("generic")}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className={buttonVariants()}
          >
            {t("retry")}
          </button>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            {t("goHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
