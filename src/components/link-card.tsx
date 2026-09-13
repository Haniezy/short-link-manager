"use client";

import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { LinkWithClicks } from "@/lib/db/queries";
import { useTranslations, useLocale } from "next-intl";

export function LinkCard({ link }: { link: LinkWithClicks }) {
  const t = useTranslations("linkCard");
  const locale = useLocale();

  return (
    <Card className="relative isolate flex flex-col gap-3 p-4 shadow-[0_2px_6px_-2px_oklch(0.575_0.205_294/0.18),0_12px_32px_-12px_oklch(0.575_0.205_294/0.25)] ring-1 ring-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_oklch(0.575_0.205_294/0.28),0_20px_40px_-12px_oklch(0.575_0.205_294/0.35)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/dashboard/links/${link.id}`}
            className="block font-mono text-sm font-semibold text-primary hover:underline after:absolute after:inset-0 after:z-0 after:cursor-pointer after:content-[''] focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary"
          >
            /r/{link.slug}
          </Link>
          {link.title ? (
            <p className="truncate text-sm text-foreground">{link.title}</p>
          ) : null}
          <a
            href={`/r/${link.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-1 truncate text-xs text-muted-foreground hover:underline"
          >
            <span className="truncate">{link.destinationUrl}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 text-primary/70" />
          </a>
        </div>
        <div className="relative z-10 shrink-0">
          <ConfirmDelete linkId={link.id} slug={link.slug} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat(locale).format(link.clickCount)}
          </span>{" "}
          {t("visits")}
          <span className="mx-1.5">·</span>
          <span>
            {new Date(link.createdAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
        <div className="relative z-10 flex gap-1">
          <CopyLinkButton slug={link.slug} compact />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/dashboard/links/${link.id}`} />}
          >
            {t("view")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
