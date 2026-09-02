import { BASE_URL } from "@/lib/config";

/**
 * Pure-CSS mockup of a dashboard card. Used on the landing page to give
 * visitors a concrete preview of the product. Static, no interactivity.
 *
 * The fake browser chrome shows the real deployed base URL (same env var that
 * builds copyable short links) so the mockup never advertises a domain the
 * product doesn't actually run on.
 */
export function DashboardMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heights = [38, 56, 42, 78, 92, 64, 50];

  return (
    <div className="mockup-shadow relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card/80 p-5 backdrop-blur-xl">
      {/* Browser-like chrome */}
      <div className="mb-4 flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-primary/30" />
        <span className="size-2.5 rounded-full bg-primary/50" />
        <span className="size-2.5 rounded-full bg-primary/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground/60">
          {BASE_URL}/dashboard
        </span>
      </div>

      {/* Title row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Clicks this week
          </p>
          <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
            12,847
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          +24%
        </div>
      </div>

      {/* Bars chart */}
      <div className="mb-4 flex h-32 items-end gap-2">
        {days.map((d, i) => (
          <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary"
              style={{ height: `${heights[i]}%` }}
            />
            <span className="text-[10px] text-muted-foreground/70">{d}</span>
          </div>
        ))}
      </div>

      {/* Link rows */}
      <div className="space-y-2.5">
        {[
          { slug: "/r/launch", clicks: "3,412" },
          { slug: "/r/promo", clicks: "2,089" },
          { slug: "/r/q4-deal", clicks: "1,154" },
        ].map((row) => (
          <div
            key={row.slug}
            className="flex items-center justify-between rounded-lg border border-primary/10 bg-background/40 px-3 py-2"
          >
            <span className="font-mono text-xs text-primary">{row.slug}</span>
            <span className="text-xs text-muted-foreground">
              {row.clicks} clicks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}