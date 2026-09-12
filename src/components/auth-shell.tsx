import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell flex min-h-[calc(100dvh-3.5rem-1px)] items-center justify-center py-8">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
