"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "@/lib/locale";
import "./auth-overlay.css";

export function AuthOverlaySlot({ children, locale }: { children: ReactNode; locale: Locale }) {
  const segment = useSelectedLayoutSegment("auth");
  if (segment !== "(.)login" && segment !== "(.)signup") return children;
  const title = segment === "(.)login" ? (locale === "fa" ? "ورود" : "Log in") : (locale === "fa" ? "ساخت حساب" : "Sign up");
  return <AuthOverlay title={title}>{children}</AuthOverlay>;
}

function AuthOverlay({ children, title }: { children: ReactNode; title: string }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => router.push("/"), 850);
    return () => window.clearTimeout(timer);
  }, [closing, router]);
  function close() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) router.push("/");
    else setClosing(true);
  }
  return <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
    <DialogContent className="auth-route-overlay" data-closing={closing || undefined} showCloseButton={false}
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const anchor = event.target.closest("a");
        if (anchor?.getAttribute("href") === "/" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault(); close();
        }
      }}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {children}
    </DialogContent>
  </Dialog>;
}
