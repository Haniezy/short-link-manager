"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Revalidate the current route's server data when the tab regains focus or
 * becomes visible again, and do a full `window.location.reload()` on bfcache
 * restores, where the React tree is stale-frozen and `router.refresh()` is a
 * no-op. There is deliberately no timer — server data goes stale between
 * navigations, but every visit back to the tab picks up new click counts
 * without any background traffic or interrupted typing.
 *
 * Mount this once in any subtree that renders server data the user might have
 * updated elsewhere (e.g. by visiting /r/[slug] in another tab and coming
 * back).
 */
export function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    let lastRefreshAt = 0;
    const revalidate = (hard = false) => {
      // Throttle so a flurry of focus/visibility events doesn't loop us.
      const now = Date.now();
      if (now - lastRefreshAt < 1_000) return;
      lastRefreshAt = now;
      if (hard) window.location.reload();
      else router.refresh();
    };
    const isEditing = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };
    const onVisible = () => {
      if (document.visibilityState === "hidden") return;
      // Don't interrupt active typing; the refresh happens on the next
      // focus/visibility event after the field loses focus.
      if (isEditing()) return;
      revalidate();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) revalidate(true);
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
