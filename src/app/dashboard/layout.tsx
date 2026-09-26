import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { readLocale } from "@/lib/locale-server";
import { SiteHeader } from "@/components/site/header";
import { RefreshStats } from "@/components/dashboard/refresh-stats";
import "./dashboard.css";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const locale = await readLocale();
  return <div className="dashboard-shell"><RefreshStats /><SiteHeader locale={locale} email={user.email} name={user.name} image={user.image} dashboard />{children}<footer className="dashboard-footer"><span dir="ltr">LinkFlow</span><span>{locale === "fa" ? "لینک‌های شما، در اختیار شما." : "Your links. Your space."}</span><Link href="/">{locale === "fa" ? "صفحهٔ اصلی" : "Home"}</Link></footer></div>;
}
