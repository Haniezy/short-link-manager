import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { readLocale } from "@/lib/locale-server";
import { DisplayControls } from "@/components/landing/controls";
import { AuthForm } from "./auth-form";
import "./auth.css";

export async function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const locale = await readLocale();
  const fa = locale === "fa";
  return <main className={`auth-page auth-page-${mode}`}>
    <div className="auth-page-content">
      <nav className="auth-page-nav" aria-label={fa ? "تنظیمات صفحه" : "Page controls"}><Link href="/" className="auth-back" aria-label={fa ? "بازگشت به صفحهٔ اصلی" : "Back to home"}>{fa ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}</Link><DisplayControls locale={locale} /></nav>
      <header className="auth-page-heading"><Link href="/" className="auth-wordmark" dir="ltr">LinkFlow</Link><h1>{mode === "login" ? fa ? "خوش برگشتید!" : "Welcome back!" : fa ? "حسابتان را بسازید." : "Create an Account."}</h1></header>
      <AuthForm mode={mode} locale={locale} />
    </div>
  </main>;
}
