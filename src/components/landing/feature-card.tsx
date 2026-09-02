import type { LucideIcon } from "lucide-react";

/**
 * Feature card with an icon chip, title, and body. Used in the features grid
 * on the landing page.
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="feature-card group rounded-2xl border border-primary/15 bg-card/70 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_8px_30px_-12px_oklch(0.575_0.205_294/0.35)]">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_4px_14px_-2px_oklch(0.575_0.205_294/0.45)]">
        <Icon className="size-5" />
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}