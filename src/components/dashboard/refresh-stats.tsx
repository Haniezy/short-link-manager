"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

// Read persisted counts; opening a link must only count at the redirect endpoint.
export function RefreshStats() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lastRefresh = useRef(0);

  useEffect(() => {
    let clickTimer: ReturnType<typeof setTimeout> | undefined;
    function refresh() {
      if (document.visibilityState !== "visible" || pending || Date.now() - lastRefresh.current < 1000) return;
      lastRefresh.current = Date.now();
      startTransition(() => router.refresh());
    }
    function onLinkClick(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || !new URL(anchor.href).pathname.startsWith("/r/")) return;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(refresh, 1000);
    }
    const interval = setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    document.addEventListener("click", onLinkClick);
    document.addEventListener("auxclick", onLinkClick);
    return () => {
      clearInterval(interval);
      clearTimeout(clickTimer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      document.removeEventListener("click", onLinkClick);
      document.removeEventListener("auxclick", onLinkClick);
    };
  }, [router, pending]);

  return null;
}
