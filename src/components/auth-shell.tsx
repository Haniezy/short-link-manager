import type { ReactNode } from "react";

/**
 * Shared background for the auth pages. Renders a slowly drifting cluster of
 * blurred color orbs behind a translucent panel. Kept server-rendered so it
 * ships zero JS.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell relative isolate flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-4 py-10">
      {/* Soft base gradient — slightly stronger in dark mode via CSS vars */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_100%,color-mix(in_oklch,var(--accent)_35%,transparent),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_100%,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_55%)]"
      />

      {/* Drifting orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="auth-orb auth-orb--a" />
        <span className="auth-orb auth-orb--b" />
        <span className="auth-orb auth-orb--c" />
        <span className="auth-grid" />
      </div>

      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}