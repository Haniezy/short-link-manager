import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CircleCheckBig,
  Database,
  Gauge,
  LayoutDashboard,
  Link2,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import { FeatureCard } from "@/components/landing/feature-card";

export default async function Home() {
  const session = await auth.getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="landing-wrap relative isolate overflow-x-clip">
      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/25 opacity-70 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 -z-10 size-[400px] rounded-full bg-accent/40 opacity-60 blur-[100px]"
      />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span>Short links that actually get tracked</span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">Short links,</span>
              <br />
              <span className="gradient-text">measurable clicks.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
              Create short, memorable links in seconds. Share them anywhere
              — email, social, QR — and watch the clicks roll in from a clean
              real-time dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-6">
                  Get started free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="px-6">
                  I already have an account
                </Button>
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              {["No credit card", "Free forever", "Set up in 30s"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CircleCheckBig className="size-3.5 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="mockup-glow absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-accent/40 blur-2xl" />
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            What you get
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a serious short link needs.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Built for makers, marketers, and teams who care about knowing which
            links actually work.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Link2}
            title="One-click short links"
            description="Paste a long URL, pick a slug or auto-generate one. Done — no configuration hell."
          />
          <FeatureCard
            icon={Activity}
            title="Real-time analytics"
            description="Clicks per day, week, month. Every click is recorded the moment it happens, no batch delays."
          />
          <FeatureCard
            icon={MousePointerClick}
            title="Click-through redirect"
            description="Every short link runs through /r/[slug], so even clicks from your own dashboard get tracked."
          />
          <FeatureCard
            icon={Database}
            title="Your data stays yours"
            description="Local Postgres by default. No third-party trackers, no analytics farms, no surprises."
          />
          <FeatureCard
            icon={Gauge}
            title="Lightning fast"
            description="Built on Next.js 16 with a local-first architecture. Redirects happen in milliseconds."
          />
          <FeatureCard
            icon={LayoutDashboard}
            title="A dashboard you'll enjoy"
            description="Purple-tinted dark mode, smooth animations, no clutter. Designed to feel premium, not enterprise."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <div className="cta-card relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-10 text-center sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 -z-0 size-[400px] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
          />
          <h2 className="relative text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see what your links are doing?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
            Set up takes less than a minute. No card, no email confirmation
            dance — just create an account and start shortening.
          </p>
          <div className="relative mt-6 flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-7">
                Create your free account
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}