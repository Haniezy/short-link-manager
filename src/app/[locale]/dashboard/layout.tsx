import type { ReactNode } from "react";
import { RefreshOnFocus } from "@/components/refresh-on-focus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Dashboard shell. Adds a no-UI client component that keeps server-rendered
 * data fresh whenever the tab regains focus — so click counts update the
 * moment the user returns from /r/[slug], without a manual reload.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RefreshOnFocus />
      {children}
    </>
  );
}