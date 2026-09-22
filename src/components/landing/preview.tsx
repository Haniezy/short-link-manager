"use client";
import { Link2, Copy, MousePointer2, ArrowUpRight, BarChart3, LayoutList, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { copy, type Locale } from "@/lib/locale";
export function DashboardPreview({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <div className="preview-frame">
    <div className="preview-browser"><div className="browser-dots" aria-hidden="true"><i /><i /><i /></div><span><LockIcon />linkflow / dashboard</span><span className="sample-badge">{t.sample}</span></div>
    <Tabs defaultValue="links" className="preview-app">
      <div className="preview-toolbar"><span className="preview-workspace"><Link2 size={17} />{t.workspace}</span><TabsList><TabsTrigger value="links"><LayoutList size={14} />{t.linksTab}</TabsTrigger><TabsTrigger value="stats"><BarChart3 size={14} />{t.statsTab}</TabsTrigger></TabsList></div>
      <TabsContent value="links" className="preview-panels">
        <div className="mock-links panel-surface"><div className="mock-panel-title"><span>{t.myLinks}</span><span className="count-badge">{locale === "fa" ? "۳" : "3"}</span></div>
          {["new-project", "portfolio", "read-more"].map((slug, index) => <div className="mock-link" key={slug}><span className={"mock-link-icon icon-color-" + index}><Link2 size={17} /></span><div><strong>{t.exampleTitles[index]}</strong><span className="mock-slug" dir="ltr">linkflow / {slug}</span></div><span className="mock-count" dir="ltr">{[128, 64, 32][index]} <MousePointer2 size={12} /></span><Copy size={14} className="mock-copy" aria-hidden="true" /></div>)}
        </div>
        <div className="custom-preview"><div className="cover-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-chain"><Link2 /></div><span className="art-star star-one">✦</span><span className="art-star star-two">✦</span></div><div className="custom-preview-text"><span>{t.custom}</span><strong>{t.sampleSlug}</strong><p>{t.customText}</p><div className="example-pill" dir="ltr"><span>linkflow /</span> your-story<Check size={12} /></div></div></div>
        <div className="mini-chart panel-surface"><div className="mock-panel-title"><span>{t.chartTitle}</span><span className="chart-pill"><BarChart3 size={12} /></span></div><div className="mock-chart-number">{locale === "fa" ? "۲۲۴" : "224"}<small>{t.clicks}</small></div><SampleChart locale={locale} /></div>
      </TabsContent>
      <TabsContent value="stats" className="preview-stat-panel panel-surface"><div className="stats-heading"><div><span className="little-label">{t.chartSub}</span><h3>{t.chartTitle}</h3></div><span className="mock-chart-number">{locale === "fa" ? "۲۲۴" : "224"}<small>{t.clicks}</small></span></div><SampleChart locale={locale} large /><div className="sample-stat-footer"><span><MousePointer2 size={14} />{t.sample}</span><span dir="ltr">/ new-project <ArrowUpRight size={14} /></span></div></TabsContent>
    </Tabs>
  </div>;
}
function LockIcon() { return <span className="browser-lock" aria-hidden="true">◆</span>; }
function SampleChart({ locale, large = false }: { locale: Locale; large?: boolean }) {
  return <div className={large ? "sample-chart large-chart" : "sample-chart"}><svg viewBox="0 0 320 125" role="img" aria-label={copy[locale].chartTitle} preserveAspectRatio="none"><defs><linearGradient id={large ? "areaLarge" : "areaSmall"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8470ed" stopOpacity=".28" /><stop offset="100%" stopColor="#8470ed" stopOpacity="0" /></linearGradient></defs><path d="M0 30H320M0 65H320M0 100H320" stroke="currentColor" strokeOpacity=".08" strokeDasharray="3 5" /><path d="M0 112 C20 107 25 69 50 81 S88 105 106 76 S145 9 165 47 S197 116 222 69 S263 1 280 25 S306 60 320 10 L320 125 L0 125Z" fill={large ? "url(#areaLarge)" : "url(#areaSmall)"} /><path d="M0 112 C20 107 25 69 50 81 S88 105 106 76 S145 9 165 47 S197 116 222 69 S263 1 280 25 S306 60 320 10" fill="none" stroke="#8470ed" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg><div className="chart-days" dir="ltr">{copy[locale].demoWeeks.map((day) => <span key={day}>{day}</span>)}</div></div>;
}
