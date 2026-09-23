import Link from "next/link";
import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { readLocale } from "@/lib/locale-server";
import { DisplayControls } from "@/components/landing/controls";
import { AuthForm } from "./auth-form";
import "./auth.css";

export async function AuthScreen({ mode, notice }: { mode: "login" | "signup"; notice?: "required" | "unavailable" }) {
  const locale = await readLocale();
  const fa = locale === "fa";
  return <main key={mode} className={`auth-page auth-page-${mode}`}>
    <svg className="auth-panel-mask" aria-hidden="true" width="0" height="0">
      <defs>
        <clipPath id="auth-panel-clip" clipPathUnits="objectBoundingBox">
          <path d="M0 0H.49L.6515 .76Q.66 .8 .631 .82L.37 1H0Z" />
        </clipPath>
        <clipPath id="auth-panel-clip-tablet" clipPathUnits="objectBoundingBox">
          <path d="M0 0H.54L.6825 .798Q.69 .84 .664 .856L.43 1H0Z" />
        </clipPath>
      </defs>
    </svg>
    <div className="auth-art" aria-hidden="true">
      <svg className="auth-art-shapes" viewBox="0 0 620 680" fill="none">
        <defs>
          <linearGradient id="auth-back-glass" x1="90" y1="100" x2="550" y2="600" gradientUnits="userSpaceOnUse"><stop stopColor="#b5acff" stopOpacity=".85" /><stop offset="1" stopColor="#7663ee" stopOpacity=".35" /></linearGradient>
          <linearGradient id="auth-front-glass" x1="150" y1="130" x2="490" y2="540" gradientUnits="userSpaceOnUse"><stop stopColor="#dad2ff" stopOpacity=".92" /><stop offset=".45" stopColor="#9686ff" stopOpacity=".78" /><stop offset="1" stopColor="#5440de" stopOpacity=".9" /></linearGradient>
          <filter id="auth-art-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#251380" floodOpacity=".3" /></filter>
        </defs>
        <path d="M480 96Q526 70 526 125V578Q526 617 487 595L114 378Q76 355 113 331Z" fill="#3821c4" fillOpacity=".68" />
        <path d="M334 48Q366 10 383 60L539 515Q553 558 509 546L74 426Q29 414 59 379Z" fill="url(#auth-back-glass)" stroke="#d5ccff" strokeOpacity=".3" />
        <path d="M94 126Q90 77 134 103L555 346Q599 372 554 399L130 644Q89 668 90 621Z" fill="url(#auth-back-glass)" stroke="#e5e0ff" strokeOpacity=".8" filter="url(#auth-art-shadow)" />
        <path d="M221 132Q235 85 273 120L551 372Q589 409 539 426L145 555Q99 569 114 521Z" fill="url(#auth-front-glass)" stroke="#dfd8ff" strokeOpacity=".45" filter="url(#auth-art-shadow)" />
      </svg>
      <div className="auth-art-brand" dir="ltr"><Link2 /><span>LinkFlow</span></div>
      <p className="auth-art-caption">{fa ? "لینک‌های کوتاه‌تر، ارتباط‌های بهتر." : "Shorter links. Better connections."}</p>
    </div>
    <div className="auth-page-content">
      <nav className="auth-page-nav" aria-label={fa ? "تنظیمات صفحه" : "Page controls"}><Link href="/" className="auth-back" aria-label={fa ? "بازگشت به صفحهٔ اصلی" : "Back to home"}>{fa ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}</Link><DisplayControls locale={locale} /></nav>
      <header className="auth-page-heading"><Link href="/" className="auth-wordmark" dir="ltr"><span className="auth-brand-icon"><Link2 size={23} /></span>LinkFlow</Link><h1>{mode === "login" ? fa ? "خوش برگشتید!" : "Welcome back!" : fa ? "حسابتان را بسازید." : "Create an Account."}</h1><p className="auth-intro">{mode === "login" ? fa ? "برای مدیریت لینک‌هایتان وارد حساب شوید." : "Enter your details to manage your links." : fa ? "اولین قدم برای لینک‌های کوتاه‌تر و به‌یادماندنی." : "Your first step to shorter, memorable links."}</p></header>
      <AuthForm mode={mode} locale={locale} notice={notice} />
    </div>
  </main>;
}
