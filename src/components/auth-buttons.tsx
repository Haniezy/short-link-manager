"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export function AuthButtons() {
  const t = useTranslations("auth");

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        {t("login")}
      </Link>
      <Link href="/signup" className={buttonVariants({ size: "sm" })}>
        {t("signup")}
      </Link>
    </div>
  );
}
