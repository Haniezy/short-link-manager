import { SiteHeader } from "@/components/site/header";
import { ArrowUpRight, Link2, Copy, BarChart3, FolderHeart, MousePointer2, ShieldCheck, Check, MoveDown, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { readLocale } from "@/lib/locale-server";
import { copy } from "@/lib/locale";
import { getCurrentUser } from "@/lib/auth/session";
import { LandingSession, AuthButton } from "@/components/landing/session";
import { DisplayControls } from "@/components/landing/controls";
import { Shortener } from "@/components/landing/shortener";
import { DashboardPreview } from "@/components/landing/preview";

export default async function Home() {
  const locale = await readLocale(), t = copy[locale];
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try { user = await getCurrentUser(); } catch { /* Public landing remains available during an auth outage. */ }
  const email = user?.email ?? null;
  const icons = [Link2, FolderHeart, MousePointer2, BarChart3];
  const strengths = [Link2, Copy, BarChart3, FolderHeart];
  return <LandingSession locale={locale} initialEmail={email}>
    <div id="top" className="landing">
      <a className="skip-link" href="#main">{t.skip}</a>
      <SiteHeader locale={locale} email={email} name={user?.name} image={user?.image} />
      <main id="main">
        <section className="hero section-container">
          <div className="eyebrow hero-eyebrow"><span className="live-dot" />{t.pill}<Sparkles size={12} /></div>
          <h1>{t.heading}<br /><span className="gradient-text">{t.accent}</span>{t.ending && <> {t.ending}</>}</h1>
          <p className="hero-description">{t.intro}</p>
          <Shortener />
          <div className="hero-buttons"><AuthButton className="purple-button hero-primary">{t.start}<ArrowUpRight size={17} /></AuthButton><a className="secondary-link" href="#preview">{t.explore}<BarChart3 size={16} /></a></div>
          <div className="hero-reassurance"><ShieldCheck size={13} />{t.noCard}<span>·</span>{t.own}</div>
          <div className="strengths">{t.strengths.map((text, index) => { const Icon = strengths[index]; return <div key={text}><Icon size={19} /><span>{text}</span></div>; })}</div>
        </section>
        <section id="preview" className="preview-section section-container" aria-label={t.preview}>
          <DashboardPreview locale={locale} />
          <div className="preview-caption"><span className="caption-line" /><p>{t.previewText}</p><span className="caption-line" /></div>
        </section>
        <section id="features" className="features-section section-container">
          <div className="section-heading"><span className="eyebrow">{t.featureEyebrow}</span><h2>{t.featureTitle}</h2><p>{t.featureIntro}</p></div>
          <div className="feature-grid">{t.featureCards.map((feature, index) => { const Icon = icons[index]; return <article className="feature-card" key={feature.title}><span className={"feature-icon feature-icon-" + index}><Icon size={23} /></span><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-tag">{feature.tag}{locale === "fa" ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}</span></article>; })}</div>
        </section>
        <section className="comparison-section section-container">
          <div className="comparison-copy"><span className="eyebrow">{t.comparisonTag}</span><h2>{t.comparisonTitle}</h2><p>{t.comparisonFoot}</p><div className="comparison-mini-icons" aria-hidden="true"><span><Link2 /></span><span><Copy /></span><span><Check /></span></div></div>
          <div className="comparison-demo"><div className="before-link"><span>{t.before}</span><code dir="ltr">https://example.com/articles/your-next-big-idea?utm_source=social&amp;utm_campaign=launch</code></div><div className="comparison-arrow"><MoveDown size={20} /></div><div className="after-link"><span>{t.after}</span><div dir="ltr"><Link2 size={17} /><code>linkflow / your-idea</code><Check size={17} /></div></div><span className="comparison-sample">{t.sample}</span></div>
        </section>
        <section id="how-it-works" className="steps-section section-container">
          <div className="section-heading"><span className="eyebrow">{t.stepsEyebrow}</span><h2>{t.stepsTitle}</h2></div>
          <div className="steps-grid">{t.steps.map((step, index) => <article className="step-card" key={step.title}><span className={"step-number step-number-" + index}>{new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(index + 1)}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        </section>
        <section className="cta-section section-container"><div className="cta-panel"><div className="cta-orbit cta-orbit-one" aria-hidden="true" /><div className="cta-orbit cta-orbit-two" aria-hidden="true" /><span className="cta-eyebrow"><Sparkles size={12} />{t.ctaTag}</span><h2>{t.ctaTitle}</h2><p>{t.ctaText}</p><AuthButton className="cta-button">{t.cta}<ArrowUpRight size={17} /></AuthButton><div className="cta-checks"><span><Check size={13} />{t.noCard}</span><span><Check size={13} />{t.easy}</span></div></div></section>
      </main>
      <footer className="site-footer"><div className="section-container footer-top"><div className="footer-brand"><a href="#top" className="brand"><span className="brand-symbol"><Link2 size={19} /></span><span dir="ltr">Link<span>Flow</span></span></a><p>{t.footerText}</p></div><div className="footer-column"><strong>{t.product}</strong><a href="#features">{t.features}</a><a href="#preview">{t.preview}</a><a href="#how-it-works">{t.how}</a></div><div className="footer-column"><strong>{t.access}</strong><AuthButton mode="login" className="footer-auth">{t.login}</AuthButton><AuthButton className="footer-auth">{t.signup}</AuthButton></div><div className="footer-message"><Link2 size={28} /><p>{t.footerNote}</p></div></div><div className="section-container footer-bottom"><span>{t.rights}</span><DisplayControls locale={locale} /></div></footer>
    </div>
  </LandingSession>;
}
