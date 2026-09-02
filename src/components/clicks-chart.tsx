"use client";

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
function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
}

export function ClicksChart({ data }: { data: DailyClicks[] }) {
  const chartData = data.map((d) => ({
    day: formatDay(d.date),
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
            No clicks in the last 7 days yet
          </p>
          <p className="max-w-[18rem] text-xs text-muted-foreground">
            Share the short link and the chart will populate as people visit it.
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
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.date ?? ""
              }
            />
            <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
