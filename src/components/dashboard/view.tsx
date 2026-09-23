import Link from "next/link";
import { ArrowUpRight, Link2, MousePointer2, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import type { Link as LinkRecord } from "@/lib/db/schema";
import type { Locale } from "@/lib/locale";
import { getShortUrl } from "@/lib/short-url";
import { CreateLinkForm } from "./create-form";
import { LinkControls } from "./link-controls";

export type DashboardData = { links: LinkRecord[]; total: number; totalClicks: number; page: number; pages: number };
export function DashboardView({ data, locale }: { data: DashboardData; locale: Locale }) {
  const fa = locale === "fa", number = new Intl.NumberFormat(fa ? "fa-IR" : "en-US"), date = new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { dateStyle: "medium", timeZone: "UTC" });
  return <main className="dashboard-main">
    <div className="dashboard-welcome"><div><span className="dashboard-eyebrow"><span />{fa ? "فضای کاری شما" : "YOUR WORKSPACE"}</span><h1>{fa ? "لینک‌های کوچک، فرصت‌های بزرگ." : "Small links. Big possibilities."}</h1><p>{fa ? "بسازید، به اشتراک بگذارید و نتیجه را ببینید؛ همه در یک جا." : "Create, share, and see what happens. All in one place."}</p></div><a className="dashboard-create-jump" href="#create-link"><PlusLabel fa={fa} /></a></div>
    <CreateLinkForm locale={locale} />
    <section className="dashboard-overview" aria-label={fa ? "خلاصهٔ لینک‌ها" : "Link overview"}>
      <div className="dashboard-panel metric"><span className="metric-icon"><Link2 size={20} /></span><div><span>{fa ? "همهٔ لینک‌ها" : "Total links"}</span><strong>{number.format(data.total)}</strong><small>{fa ? "لینک‌های ساخته‌شدهٔ شما" : "Created in your workspace"}</small></div></div>
      <div className="dashboard-panel metric"><span className="metric-icon green"><MousePointer2 size={20} /></span><div><span>{fa ? "مجموع کلیک‌ها" : "Total clicks"}</span><strong>{number.format(data.totalClicks)}</strong><small>{fa ? "هر کلیک، یک ارتباط تازه" : "Every click, a new connection"}</small></div></div>
      <div className="dashboard-panel personal-card"><span className="personal-chain"><Link2 size={27} /></span><div><span className="dashboard-eyebrow">{fa ? "آدرس دلخواه" : "MAKE IT YOURS"}</span><h2>{fa ? "لینکی کوتاه، با امضای شما." : "A little link. A personal touch."}</h2><p>{fa ? "نامی انتخاب کنید که به خاطر بماند." : "Choose a name worth remembering."}</p></div><Sparkles size={18} className="personal-spark" /></div>
    </section>
    <section className="dashboard-panel links-panel"><div className="dashboard-panel-heading"><h2><Link2 size={18} />{fa ? "لینک‌های من" : "Your links"}<span className="links-count">{number.format(data.total)}</span></h2><span>{fa ? "جدیدترین‌ها، ابتدا" : "Newest first"}</span></div>
      {data.links.length === 0 ? <div className="dashboard-empty"><span className="empty-icon"><Link2 size={32} /></span><h3>{fa ? "اولین لینک شما از همین‌جا شروع می‌شود." : "Your first link starts here."}</h3><p>{fa ? "یک آدرس طولانی دارید؟ از فرم بالا اولین لینک کوتاهتان را بسازید." : "Have a long URL? Use the form above to create your first short link."}</p><a href="#create-link">{fa ? "ساخت اولین لینک" : "Create your first link"}<ArrowUpRight size={16} /></a></div> : <div className="link-list">{data.links.map((link, index) => <article className="dashboard-link" key={link.id}>
        <span className={`list-link-icon tone-${index % 3}`}><Link2 size={20} /></span><div className="link-description"><Link href={`/dashboard/links/${link.id}`} className="link-title">{link.title || link.slug}<ArrowUpRight size={14} /></Link><a href={getShortUrl(link.slug)} target="_blank" rel="noreferrer" className="short-address" dir="ltr">{getShortUrl(link.slug)}</a><span className="link-destination" dir="ltr" title={link.destinationUrl}>{link.destinationUrl}</span></div>
        <div className="link-metadata"><span><MousePointer2 size={13} /><b>{number.format(link.clicks)}</b> {fa ? "کلیک" : "clicks"}</span><time dateTime={link.createdAt.toISOString()}>{date.format(link.createdAt)}</time></div><LinkControls id={link.id} slug={link.slug} url={getShortUrl(link.slug)} locale={locale} />
      </article>)}</div>}
      {data.pages > 1 && <nav className="dashboard-pagination" aria-label={fa ? "صفحه‌بندی" : "Pagination"}>{data.page > 1 ? <Link href={`/dashboard?page=${data.page - 1}`}>{fa ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}{fa ? "قبلی" : "Previous"}</Link> : <span /> }<span>{number.format(data.page)} / {number.format(data.pages)}</span>{data.page < data.pages ? <Link href={`/dashboard?page=${data.page + 1}`}>{fa ? "بعدی" : "Next"}{fa ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}</Link> : <span />}</nav>}
    </section>
  </main>;
}
function PlusLabel({ fa }: { fa: boolean }) { return <><Sparkles size={15} />{fa ? "یک لینک تازه" : "A fresh link"}</>; }
