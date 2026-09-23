import Link from "next/link";
import { Link2 } from "lucide-react";
import { DisplayControls } from "@/components/landing/controls";
import { HeaderAccount } from "./header-account";
import { copy, type Locale } from "@/lib/locale";

export function SiteHeader({ locale, email, dashboard = false }: { locale: Locale; email: string | null; dashboard?: boolean }) {
  const t = copy[locale];
  return <header className="site-header"><div className="header-inner">
    <Link href={dashboard ? "/" : "/#top"} className="brand" aria-label={`LinkFlow — ${t.home}`}><span className="brand-symbol"><Link2 size={19} /></span><span dir="ltr">Link<span>Flow</span></span></Link>
    <nav className="header-nav" aria-label={t.product}>{dashboard ? <><Link href="/dashboard" aria-current="page">{locale === "fa" ? "لینک‌های من" : "My links"}</Link><Link href="/">{t.home}</Link></> : <><a href="#features">{t.features}</a><a href="#how-it-works">{t.how}</a><a href="#preview">{t.preview}</a></>}</nav>
    <div className="header-actions"><DisplayControls locale={locale} /><HeaderAccount locale={locale} email={email} /></div>
  </div></header>;
}
