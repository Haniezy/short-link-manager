"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import type { Locale } from "@/lib/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";

const labels = {
  fa: { email: "ایمیل", password: "رمز عبور", confirm: "تکرار رمز عبور", login: "ورود", signup: "ساخت حساب", pending: "لطفاً صبر کنید…", show: "نمایش رمز عبور", hide: "پنهان‌کردن رمز عبور", existing: "از قبل حساب دارید؟", new: "هنوز حساب ندارید؟", invalid: "لطفاً ایمیل و رمز عبور را بررسی کنید.", mismatch: "رمز عبور و تکرار آن یکسان نیستند.", failed: "انجام این درخواست ممکن نشد. لطفاً دوباره تلاش کنید.", verify: "برای تکمیل ثبت‌نام، ایمیلتان را تأیید کنید.", hint: "حداقل ۸ کاراکتر" },
  en: { email: "Email", password: "Password", confirm: "Re-enter password", login: "Log in", signup: "Sign up", pending: "Please wait…", show: "Show password", hide: "Hide password", existing: "Already have an account?", new: "Don’t have an account?", invalid: "Please check your email and password.", mismatch: "Your passwords do not match.", failed: "We couldn’t complete that request. Please try again.", verify: "Check your email to verify your account.", hint: "At least 8 characters" },
};

export function AuthForm({ mode, locale }: { mode: "login" | "signup"; locale: Locale }) {
  const t = labels[locale], signup = mode === "signup", router = useRouter();
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const parsed = (signup ? registerSchema : loginSchema).safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) { setMessage(t.invalid); return; }
    if (signup && parsed.data.password !== form.get("confirmPassword")) { setMessage(t.mismatch); return; }
    setPending(true); setMessage("");
    try {
      const result = await (signup ? registerAction : loginAction)(parsed.data);
      if (result.error || !result.data) { setMessage(t.failed); return; }
      if (result.data.requiresEmailVerification) { setMessage(t.verify); return; }
      router.replace("/"); router.refresh();
    } catch { setMessage(t.failed); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="auth-page-form" aria-busy={pending}>
    <div className="auth-line-field"><Label htmlFor="email">{t.email}</Label><Input id="email" name="email" type="email" autoComplete="email" dir="ltr" placeholder="you@example.com" required maxLength={254} disabled={pending} /></div>
    <div className="auth-line-field"><Label htmlFor="password">{t.password}</Label><div className="auth-password-wrap"><Input id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} dir="ltr" placeholder={signup ? t.hint : "••••••••"} required minLength={signup ? 8 : 1} maxLength={128} disabled={pending} /><Button type="button" variant="ghost" size="icon" onClick={() => setVisible(!visible)} aria-label={visible ? t.hide : t.show}>{visible ? <EyeOff /> : <Eye />}</Button></div></div>
    {signup && <div className="auth-line-field"><Label htmlFor="confirm-password">{t.confirm}</Label><Input id="confirm-password" name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" dir="ltr" placeholder="••••••••" required minLength={8} maxLength={128} disabled={pending} /></div>}
    <p className="auth-message" role="status" aria-live="polite">{message}</p>
    <GlassButton type="submit" className="auth-submit" disabled={pending}>{pending ? t.pending : signup ? t.signup : t.login}</GlassButton>
    <p className="auth-page-switch">{signup ? t.existing : t.new} <Link href={signup ? "/login" : "/signup"}>{signup ? t.login : t.signup}</Link></p>
  </form>;
}
