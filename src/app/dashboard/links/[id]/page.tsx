import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { loadLinkDetails } from "@/lib/links";
import { readLocale } from "@/lib/locale-server";
import { getShortUrl } from "@/lib/short-url";
import { LinkControls } from "@/components/dashboard/link-controls";
import { ClickChart } from "@/components/dashboard/click-chart";
export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [locale, result] = await Promise.all([readLocale(), loadLinkDetails(id)]);
  if (!result.data) { if (result.error === "Link not found.") notFound(); throw new Error("Could not load link details."); }
  const fa = locale === "fa", { link, clicksByDay } = result.data;
  return <main className="dashboard-main detail-main"><Link href="/dashboard" className="detail-back">{fa ? "بازگشت به لینک‌ها" : "Back to your links"}</Link><div className="dashboard-welcome"><div><span className="dashboard-eyebrow">{fa ? "جزئیات لینک" : "LINK DETAILS"}</span><h1>{link.title || link.slug}</h1><a className="short-address" href={getShortUrl(link.slug)} target="_blank" rel="noreferrer" dir="ltr">{getShortUrl(link.slug)}<ArrowUpRight size={15} /></a></div><LinkControls id={link.id} url={getShortUrl(link.slug)} slug={link.slug} locale={locale} detail /></div>
    <section className="dashboard-panel detail-info"><div><span>{fa ? "آدرس مقصد" : "Destination"}</span><a href={link.destinationUrl} target="_blank" rel="noreferrer" dir="ltr">{link.destinationUrl}<ArrowUpRight size={15} /></a></div><div><span>{fa ? "مجموع کلیک‌ها" : "Total clicks"}</span><strong>{new Intl.NumberFormat(locale).format(link.clicks)}</strong></div><div><span>{fa ? "تاریخ ساخت" : "Created"}</span><time dateTime={link.createdAt.toISOString()}>{new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(link.createdAt)}</time></div></section>
    <section className="dashboard-panel detail-chart"><div className="dashboard-panel-heading"><h2><BarChart3 size={18} />{fa ? "کلیک‌ها در ۷ روز اخیر" : "Clicks over the last 7 days"}</h2></div><ClickChart days={clicksByDay} locale={locale} />{clicksByDay.every(day => day.count === 0) && <p className="chart-empty-note">{fa ? "هنوز کلیکی در این بازه ثبت نشده است؛ لینک را به اشتراک بگذارید." : "No clicks in this period yet. Share your link to get started."}</p>}</section>
  </main>;
}
