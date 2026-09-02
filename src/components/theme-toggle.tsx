"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="group/theme relative shrink-0 overflow-hidden rounded-full ring-1 ring-primary/15 transition-all duration-300 hover:ring-primary/40 hover:shadow-[0_0_18px_-2px_oklch(0.575_0.205_294/0.55)]"
    >
      {/* Soft halo that intensifies on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/0 via-primary/10 to-accent/0 opacity-0 transition-opacity duration-500 group-hover/theme:opacity-100"
      />

      <Sun
        className="h-[1.15rem] w-[1.15rem] text-amber-500 transition-all duration-500 ease-out
          dark:scale-50 dark:opacity-0 dark:-rotate-90
          group-hover/theme:text-amber-400"
        strokeWidth={2.25}
      />
      <Moon
        className="absolute h-[1.15rem] w-[1.15rem] text-primary transition-all duration-500 ease-out
          scale-50 opacity-0 rotate-90
          dark:scale-100 dark:opacity-100 dark:rotate-0
          group-hover/theme:text-primary"
        strokeWidth={2.25}
      />
    </Button>
  );
}

/**
 * Returns true after the first client render. Used to delay reading any
 * browser/extension-dependent state until hydration finishes, avoiding the
 * mismatch warning. The setState-in-effect is intentional and idiomatic for
 * the hydration-mounted pattern.
 */
function useHasMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}