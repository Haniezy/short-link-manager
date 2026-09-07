"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
];

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  const currentLabel = locales.find((item) => item.value === locale)?.label ?? "English";

  const handleChange = (next: string) => {
    router.replace(pathname, { locale: next as "en" | "fa" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label={t("language")}
            className="relative h-9 shrink-0 rounded-full px-3 ring-1 ring-primary/15 transition-all duration-300 hover:ring-primary/40"
          >
            <Globe className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.25} />
            <span className="text-sm font-medium">
              {locale === "fa" ? "FA" : "EN"}
            </span>
            <span className="sr-only">{t("language")}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[10rem]">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => handleChange(item.value)}
            className="flex items-center justify-between gap-2"
          >
            <span>{item.label}</span>
            {item.value === locale && (
              <span className="text-xs text-muted-foreground">{currentLabel}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
