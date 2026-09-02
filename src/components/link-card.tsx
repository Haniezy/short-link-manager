"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { shortUrl } from "@/lib/config";
import type { LinkWithClicks } from "@/lib/db/queries";

export function LinkCard({ link }: { link: LinkWithClicks }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const fullShortUrl = shortUrl(link.slug);

  // Re-fetch the dashboard when the tab regains focus or the page becomes
  // visible again, so click counts (and any other server-derived data) update
  // without a manual reload after the user returns from /r/<slug>.
  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Short link copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Copy it manually:");
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4 shadow-[0_2px_6px_-2px_oklch(0.575_0.205_294/0.18),0_12px_32px_-12px_oklch(0.575_0.205_294/0.25)] ring-1 ring-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_oklch(0.575_0.205_294/0.28),0_20px_40px_-12px_oklch(0.575_0.205_294/0.35)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/dashboard/links/${link.id}`}
            className="block font-mono text-sm font-semibold text-primary hover:underline"
          >
            /r/{link.slug}
          </Link>
          {link.title ? (
            <p className="truncate text-sm text-foreground">{link.title}</p>
          ) : null }
          <a
            href={link.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:underline"
          >
            <span className="truncate">{link.destinationUrl}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 text-primary/70" />
          </a>
        </div>
        <ConfirmDelete linkId={link.id} slug={link.slug} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{link.clickCount}</span>{" "}
          {link.clickCount === 1 ? "click" : "clicks"}
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={copy} aria-label="Copy short link">
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/dashboard/links/${link.id}`} />}
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  );
}
