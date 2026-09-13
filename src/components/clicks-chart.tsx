"use client";

import { useLocale, useTranslations } from "next-intl";
import { MousePointerClick } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyClicks } from "@/lib/db/queries";

/**
 * Format a YYYY-MM-DD bucket as a short weekday. Dates come from the server
 * bucketed in UTC, so format with an explicit UTC timezone so the label
 * matches the bucket regardless of the viewer's locale clock.
 */
function formatDay(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" });
}

export function ClicksChart({ data }: { data: DailyClicks[] }) {
  const locale = useLocale();
  const t = useTranslations("chart");
  const number = new Intl.NumberFormat(locale);
  const chartData = data.map((d) => ({
    day: formatDay(d.date, locale),
    date: d.date,
    clicks: d.clicks,
  }));

  const total = data.reduce((sum, d) => sum + d.clicks, 0);

  return (
    <div className="h-64 w-full">
      {total === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <MousePointerClick className="size-5" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium text-foreground">
            {t("emptyTitle")}
          </p>
          <p className="max-w-[18rem] text-xs text-muted-foreground">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={(value) => number.format(Number(value))}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
              formatter={(value) => [number.format(Number(value)), t("clicks")]}
              labelFormatter={(_label, payload) => {
                const date = payload?.[0]?.payload?.date;
                return date
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(`${date}T00:00:00Z`))
                  : "";
              }}
            />
            <Bar dataKey="clicks" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
