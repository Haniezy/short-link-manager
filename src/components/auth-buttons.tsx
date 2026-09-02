"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Log in / Sign up pair in the navbar. The button whose target page matches
 * the current route is rendered as the primary (violet, filled); the other one
 * becomes a muted secondary. This way users always see which tab they're on
 * without scanning the URL.
 */
export function AuthButtons() {
  const pathname = usePathname();
  const isLoginActive = pathname === "/login" || pathname.startsWith("/login");
  const isSignupActive = pathname === "/signup" || pathname.startsWith("/signup");

  return (
    <>
      <Link
        href="/login"
        aria-current={isLoginActive ? "page" : undefined}
        className={
          isLoginActive
            ? activeClass
            : inactiveClass
        }
      >
        {!isLoginActive && (
          <span className="absolute inset-0 -z-10 rounded-md bg-primary/10 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
        )}
        Log in
      </Link>
      <Link
        href="/signup"
        aria-current={isSignupActive ? "page" : undefined}
        className={
          isSignupActive
            ? activeClass
            : inactiveClass
        }
      >
        {!isSignupActive && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px -z-10 rounded-md bg-[radial-gradient(circle_at_50%_120%,oklch(0.575_0.205_294_/_0.18),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
          />
        )}
        Sign up
      </Link>
    </>
  );
}

/**
 * Shared outline look for whichever auth button isn't currently active. Keeps
 * Log in and Sign up visually balanced in the navbar (same border, same
 * background, same padding) so only the active one fills with violet.
 */
const inactiveClass =
  "nav-link group/btn relative inline-flex h-8 items-center rounded-md border border-primary/25 px-3 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-px hover:border-primary/60 hover:text-primary hover:shadow-[0_4px_18px_-6px_oklch(0.575_0.205_294/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const activeClass =
  "nav-cta relative inline-flex h-8 items-center rounded-md border border-transparent bg-primary px-3 text-sm font-medium text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.575_0.205_294/0.55)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";