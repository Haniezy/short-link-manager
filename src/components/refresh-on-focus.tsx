"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Revalidate the current route's server data whenever the tab regains focus,
 * becomes visible again, or on a short poll as a safety net for a tab that
 * never lost focus. A full `window.location.reload()` is reserved for bfcache
 * restores, where the React tree is stale-frozen and `router.refresh()` is a
 * no-op — everywhere else a soft refresh picks up new click counts without
 * flashing the whole page every few seconds or discarding form input.
 *
 * Revalidation is skipped entirely while the user is typing into an editable
 * field, so filling in a form is never interrupted.
 *
 * Mount this once in any subtree that renders server data the user might have
 * updated elsewhere (e.g. by visiting /r/[slug] in another tab and coming
 * back).
 */
const POLL_MS = 5_000;

function isEditing(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

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
    const onVisibility = () => {
      if (document.visibilityState === "hidden") return;
      if (isEditing()) return;
      revalidate();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) revalidate(true);
    };
    window.addEventListener("focus", onVisibility);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    // Polling safety net: revalidate periodically so a tab that never lost
    // focus still picks up clicks recorded elsewhere.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !isEditing()) revalidate();
    }, POLL_MS);
    return () => {
      window.removeEventListener("focus", onVisibility);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
