"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import { loginSchema, registerFormSchema, validationError } from "@/lib/validation";
import type { Locale } from "@/lib/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";

const labels = {
  fa: { email: "ایمیل", password: "رمز عبور", confirm: "تکرار رمز عبور", login: "ورود", signup: "ساخت حساب", pending: "لطفاً صبر کنید…", show: "نمایش رمز عبور", hide: "پنهان‌کردن رمز عبور", existing: "از قبل حساب دارید؟", new: "هنوز حساب ندارید؟", invalid: "لطفاً ایمیل و رمز عبور را بررسی کنید.", mismatch: "رمز عبور و تکرار آن یکسان نیستند.", failed: "انجام این درخواست ممکن نشد. لطفاً دوباره تلاش کنید.", verify: "برای تکمیل ثبت‌نام، ایمیلتان را تأیید کنید.", hint: "حداقل ۸ کاراکتر" },
  en: { email: "Email", password: "Password", confirm: "Re-enter password", login: "Log in", signup: "Sign up", pending: "Please wait…", show: "Show password", hide: "Hide password", existing: "Already have an account?", new: "Don’t have an account?", invalid: "Please check your email and password.", mismatch: "Your passwords do not match.", failed: "We couldn’t complete that request. Please try again.", verify: "Check your email to verify your account.", hint: "At least 8 characters" },
};

const fieldMessages: Record<string, string> = {
  "Enter a valid email address.": "یک آدرس ایمیل معتبر وارد کنید.",
  "Email is too long.": "ایمیل باید حداکثر ۲۵۴ کاراکتر باشد.",
  "Password must be at least 8 characters.": "رمز عبور باید حداقل ۸ کاراکتر باشد.",
  "Password must be at most 128 characters.": "رمز عبور باید حداکثر ۱۲۸ کاراکتر باشد.",
  "Password is too long.": "رمز عبور باید حداکثر ۱۲۸ کاراکتر باشد.",
  "Password is required.": "رمز عبور را وارد کنید.",
  "Please re-enter your password.": "تکرار رمز عبور را وارد کنید.",
  "Your passwords do not match.": "رمز عبور و تکرار آن یکسان نیستند.",
};

export function AuthForm({ mode, locale, notice }: { mode: "login" | "signup"; locale: Locale; notice?: "required" | "unavailable" }) {
  const t = labels[locale], signup = mode === "signup", router = useRouter();
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const fa = locale === "fa";
  useEffect(() => {
    if (!notice) return;
    const text = notice === "required"
      ? fa ? "برای دسترسی به داشبورد، ابتدا وارد حساب شوید." : "Please sign in to access your dashboard."
      : fa ? "بررسی ورود ممکن نشد. لطفاً دوباره تلاش کنید." : "Unable to verify your session. Please try again.";
    toast.error(text, { id: "dashboard-access" });
  }, [notice, fa]);
  function fieldError(name: string) {
    const error = fieldErrors[name]?.[0];
    return error ? <p className="auth-field-error" id={`${name}-error`} role="alert">{fa ? fieldMessages[error] ?? t.invalid : error}</p> : null;
  }
  function fieldProps(name: string) {
    return { "aria-invalid": !!fieldErrors[name]?.length, "aria-describedby": fieldErrors[name]?.length ? `${name}-error` : undefined };
  }
  function fail(text: string) { setMessage(text); toast.error(text); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const parsed = (signup ? registerFormSchema : loginSchema).safeParse({ email: form.get("email"), password: form.get("password"), confirmPassword: form.get("confirmPassword") });
    setFieldErrors({}); setMessage("");
    if (!parsed.success) {
      const errors = validationError(parsed.error).fieldErrors;
      setFieldErrors(errors);
      const first = Object.keys(errors)[0];
      const input = event.currentTarget.elements.namedItem(first);
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }
    setPending(true); setMessage("");
    try {
      const result = await (signup ? registerAction : loginAction)(parsed.data);
      if (result.error || !result.data) {
        if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
        const unavailable = result.error?.includes("temporarily unavailable");
        fail(unavailable ? (fa ? "سرویس ورود و ثبت‌نام فعلاً در دسترس نیست. دوباره تلاش کنید." : "Authentication is temporarily unavailable. Please try again.")
          : signup ? (fa ? "ساخت حساب ممکن نشد. وارد شوید یا ایمیل دیگری امتحان کنید." : "Could not create an account. Try signing in or use another email.")
          : (fa ? "ورود ناموفق بود. ایمیل، رمز عبور و تأیید ایمیل را بررسی کنید." : "Could not sign in. Check your email, password and email verification."));
        return;
      }
      if (result.data.requiresEmailVerification) { setMessage(t.verify); toast.info(t.verify); return; }
      toast.success(signup ? (fa ? "حساب شما با موفقیت ساخته شد." : "Your account was created successfully.") : (fa ? "با موفقیت وارد شدید." : "You signed in successfully."));
      router.replace("/dashboard"); router.refresh();
    } catch { fail(t.failed); }
    finally { setPending(false); }
  }
  return <form noValidate onSubmit={submit} onChange={(event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      setFieldErrors((current) => ({ ...current, [input.name]: [], ...(input.name === "password" ? { confirmPassword: [] } : {}) }));
      setMessage("");
    }
  }} className="auth-page-form" aria-busy={pending}>
    <div className="auth-line-field"><Label htmlFor="email">{t.email}</Label><Input {...fieldProps("email")} id="email" name="email" type="email" autoComplete="email" dir="ltr" placeholder="you@example.com" required maxLength={254} disabled={pending} />{fieldError("email")}</div>
    <div className="auth-line-field"><Label htmlFor="password">{t.password}</Label><div className="auth-password-wrap"><Input {...fieldProps("password")} id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} dir="ltr" placeholder={signup ? t.hint : "••••••••"} required minLength={signup ? 8 : 1} maxLength={128} disabled={pending} /><Button type="button" variant="ghost" size="icon" onClick={() => setVisible((value) => !value)} aria-controls="password" aria-label={visible ? t.hide : t.show}>{visible ? <EyeOff /> : <Eye />}</Button></div>{fieldError("password")}</div>
    {signup && <div className="auth-line-field"><Label htmlFor="confirm-password">{t.confirm}</Label><div className="auth-password-wrap"><Input {...fieldProps("confirmPassword")} id="confirm-password" name="confirmPassword" type={confirmVisible ? "text" : "password"} autoComplete="new-password" dir="ltr" placeholder="••••••••" required minLength={8} maxLength={128} disabled={pending} /><Button type="button" variant="ghost" size="icon" onClick={() => setConfirmVisible((value) => !value)} aria-controls="confirm-password" aria-label={(confirmVisible ? t.hide : t.show) + " — " + t.confirm}>{confirmVisible ? <EyeOff /> : <Eye />}</Button></div>{fieldError("confirmPassword")}</div>}
    <p className="auth-message" role="status" aria-live="polite">{message}</p>
    <GlassButton type="submit" className="auth-submit" disabled={pending}>{pending ? t.pending : signup ? t.signup : t.login}</GlassButton>
    <p className="auth-page-switch">{signup ? t.existing : t.new} <Link href={signup ? "/login" : "/signup"}>{signup ? t.login : t.signup}</Link></p>
  </form>;
}
