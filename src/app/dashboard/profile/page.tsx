import { UserAvatar } from "@/components/site/user-avatar";
import Link from "next/link";
import { ShieldCheck, Link2, MousePointer2, ArrowUpRight, Monitor } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { readLocale } from "@/lib/locale-server";
import { loadDashboardPage } from "@/lib/links";
import { ProfileForm, PasswordForm, ProfileSignOut } from "@/components/profile/forms";
import "./profile.css";

export default async function ProfilePage() {
  const [user, locale, result] = await Promise.all([requireUser(), readLocale(), loadDashboardPage()]);
  const fa = locale === "fa", number = new Intl.NumberFormat(fa ? "fa-IR" : "en-US");
  return <main className="dashboard-main profile-main"><Link href="/dashboard" className="detail-back">{fa ? "بازگشت به داشبورد" : "Back to dashboard"}<ArrowUpRight size={14} /></Link>
    <section className="dashboard-panel profile-hero"><div className="profile-identity"><span className="profile-avatar"><UserAvatar name={user.name || user.email} image={user.image} size={76} /><i /></span><div><span className="dashboard-eyebrow">{fa ? "حساب کاربری شما" : "YOUR ACCOUNT"}</span><h1>{user.name || (fa ? "پروفایل من" : "My profile")}</h1><p dir="ltr">{user.email}</p><span className="profile-badge">{user.emailVerified ? (fa ? "ایمیل تأییدشده" : "Email verified") : (fa ? "ایمیل تأیید نشده" : "Email not verified")}</span></div></div><div className="profile-stats"><div><Link2 size={17} /><strong>{result.data ? number.format(result.data.total) : "—"}</strong><span>{fa ? "لینک ساخته‌شده" : "Links created"}</span></div><div><MousePointer2 size={17} /><strong>{result.data ? number.format(result.data.totalClicks) : "—"}</strong><span>{fa ? "مجموع کلیک‌ها" : "Total clicks"}</span></div></div></section>
    <div className="profile-grid"><div className="profile-primary"><ProfileForm name={user.name || ""} email={user.email} image={user.image} locale={locale} /><section className="dashboard-panel profile-panel profile-tip"><ShieldCheck size={25} /><div><h2>{fa ? "لینک‌های شما، در اختیار شما" : "Your links. Your space."}</h2><p>{fa ? "بازگشت به لندینگ شما را از حساب خارج نمی‌کند؛ تنها با انتخاب خروج، نشست بسته می‌شود." : "Visiting the home page keeps you signed in. Use Sign out to end your session."}</p></div></section></div>
    <aside className="profile-secondary"><section className="dashboard-panel profile-panel"><h2><Monitor size={18} />{fa ? "حساب فعال" : "Active account"}</h2><div className="profile-session"><span className="session-dot" /><div><strong>{fa ? "همین مرورگر" : "This browser"}</strong><p>{fa ? "وارد حساب هستید" : "You are signed in"}</p></div><span className="profile-badge">{fa ? "فعال" : "Active"}</span></div></section><PasswordForm locale={locale} /><ProfileSignOut locale={locale} /></aside></div>
  </main>;
}
