import { loadDashboardPage } from "@/lib/links";
import { readLocale } from "@/lib/locale-server";
import { DashboardView } from "@/components/dashboard/view";
export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [locale, query] = await Promise.all([readLocale(), searchParams]);
  const result = await loadDashboardPage(query.page ?? "1");
  if (!result.data) throw new Error("Could not load dashboard.");
  return <DashboardView data={result.data} locale={locale} />;
}
