"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NewLinkError({
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
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("newLinkForm")}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          {t("backToLinks")}
        </Link>
      </div>
    </div>
  );
}