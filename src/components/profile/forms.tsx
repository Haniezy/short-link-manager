"use client";

import { AvatarUpload } from "./avatar-upload";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Save, UserRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { updateProfileAction, changePasswordAction } from "@/actions/profile";
import { logoutAction } from "@/actions/auth";
import { profileSchema, passwordChangeSchema } from "@/lib/profile-validation";
import { validationError } from "@/lib/validation";
import type { Locale } from "@/lib/locale";

const translations: Record<string, string> = {
  "Name is required.": "نام خود را وارد کنید.", "Use at most 80 characters.": "نام باید حداکثر ۸۰ کاراکتر باشد.",
  "Enter your current password.": "رمز فعلی را وارد کنید.", "Use at least 8 characters.": "رمز جدید باید حداقل ۸ کاراکتر باشد.",
  "Confirm your new password.": "رمز جدید را تکرار کنید.", "Passwords do not match.": "رمزها یکسان نیستند.", "Choose a different password.": "رمز جدید باید با رمز فعلی متفاوت باشد.",
};
export function ProfileForm({ name, email, image, locale }: { name: string; email: string; image: string | null; locale: Locale }) {
  const fa = locale === "fa", router = useRouter();
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const data = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse({ name: data.get("name") });
    if (!parsed.success) { const fields = validationError(parsed.error).fieldErrors; setError(fields.name?.[0] ?? ""); return; }
    setError(""); setPending(true);
    try {
      const result = await updateProfileAction(parsed.data);
      if (result.error) { toast.error(fa ? "ذخیره نشد؛ دوباره تلاش کنید." : result.error); return; }
      toast.success(fa ? "مشخصات ذخیره شد." : "Profile saved."); router.refresh();
    } catch { toast.error(fa ? "ذخیره نشد؛ دوباره تلاش کنید." : "Could not save your profile."); }
    finally { setPending(false); }
  }
  return <section className="dashboard-panel profile-panel"><h2><UserRound size={18} />{fa ? "مشخصات فردی" : "Personal details"}</h2><p>{fa ? "نامی که در حساب شما نمایش داده می‌شود." : "Make this workspace feel like yours."}</p><form noValidate onSubmit={submit} aria-busy={pending}>
    <div className="profile-fields"><div><Label htmlFor="profile-name">{fa ? "نام نمایشی" : "Display name"}</Label><Input id="profile-name" name="name" defaultValue={name} maxLength={80} autoComplete="name" disabled={pending} aria-invalid={!!error} aria-describedby={error ? "name-error" : undefined} onChange={() => setError("")} />{error && <p id="name-error" className="dashboard-field-error" role="alert">{fa ? translations[error] ?? "نام معتبر وارد کنید." : error}</p>}</div><div><Label htmlFor="profile-email">{fa ? "ایمیل حساب" : "Account email"}</Label><Input id="profile-email" value={email} readOnly dir="ltr" /><small>{fa ? "ایمیل ورود شما؛ در این صفحه قابل تغییر نیست." : "Your sign-in email; read-only on this page."}</small></div></div>
    <GlassButton type="submit" disabled={pending}><Save size={16} />{pending ? (fa ? "در حال ذخیره…" : "Saving…") : (fa ? "ذخیرهٔ تغییرات" : "Save changes")}</GlassButton>
  </form><AvatarUpload image={image} name={name} locale={locale} /></section>;
}
export function PasswordForm({ locale }: { locale: Locale }) {
  const fa = locale === "fa", router = useRouter();
  const [pending, setPending] = useState(false), [errors, setErrors] = useState<Record<string, string[]>>({}), [visible, setVisible] = useState<Record<string, boolean>>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = event.currentTarget, data = new FormData(form);
    const parsed = passwordChangeSchema.safeParse(Object.fromEntries(data));
    if (!parsed.success) { setErrors(validationError(parsed.error).fieldErrors); return; }
    setErrors({}); setPending(true);
    try {
      const result = await changePasswordAction(parsed.data);
      if (result.error) { toast.error(fa ? "تغییر رمز انجام نشد؛ رمز فعلی را بررسی کنید و دوباره تلاش کنید." : result.error); return; }
      form.reset(); setVisible({});
      if (result.data?.requiresSignIn) {
        toast.info(fa ? "رمز تغییر کرد؛ برای ادامه با رمز جدید وارد شوید." : "Password changed. Please sign in with your new password.");
        router.replace("/login"); return;
      }
      toast.success(fa ? "رمز تغییر کرد و نشست‌های دیگر بسته شدند." : "Password changed. Other sessions signed out.");
    } catch { toast.error(fa ? "تغییر رمز انجام نشد؛ دوباره تلاش کنید." : "Could not change your password."); }
    finally { setPending(false); }
  }
  return <section className="dashboard-panel profile-panel"><h2><LockKeyhole size={18} />{fa ? "تغییر رمز عبور" : "Change password"}</h2><p>{fa ? "پس از تغییر رمز، از دستگاه‌های دیگر خارج می‌شوید." : "Changing your password also signs out other devices."}</p><form noValidate onSubmit={submit} aria-busy={pending}>
    {([['currentPassword', fa ? 'رمز فعلی' : 'Current password'], ['newPassword', fa ? 'رمز جدید' : 'New password'], ['confirmPassword', fa ? 'تکرار رمز جدید' : 'Confirm new password']] as const).map(([name, label]) => <div className="profile-field" key={name}><Label htmlFor={name}>{label}</Label><div className="profile-password"><Input id={name} name={name} type={visible[name] ? "text" : "password"} maxLength={128} autoComplete={name === "currentPassword" ? "current-password" : "new-password"} dir="ltr" disabled={pending} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={() => setErrors(previous => { const next = { ...previous }; delete next[name]; return next; })} /><Button variant="ghost" size="icon" type="button" aria-label={fa ? (visible[name] ? "پنهان کردن رمز" : "نمایش رمز") : (visible[name] ? "Hide password" : "Show password")} aria-pressed={!!visible[name]} onClick={() => setVisible(previous => ({ ...previous, [name]: !previous[name] }))}>{visible[name] ? <EyeOff size={16} /> : <Eye size={16} />}</Button></div>{errors[name] && <p className="dashboard-field-error" id={`${name}-error`} role="alert">{fa ? translations[errors[name][0]] ?? "حداکثر ۱۲۸ کاراکتر وارد کنید." : errors[name][0]}</p>}</div>)}
    <GlassButton type="submit" disabled={pending}>{pending ? (fa ? "در حال تغییر…" : "Updating…") : (fa ? "تغییر رمز عبور" : "Update password")}</GlassButton>
  </form></section>;
}
export function ProfileSignOut({ locale }: { locale: Locale }) {
  const [pending, setPending] = useState(false), router = useRouter(), fa = locale === "fa";
  async function signOut() {
    setPending(true);
    try { const result = await logoutAction(); if (result.error) throw new Error(); toast.success(fa ? "از حساب خارج شدید." : "Signed out."); router.replace("/"); router.refresh(); }
    catch { toast.error(fa ? "خروج انجام نشد؛ دوباره تلاش کنید." : "Could not sign out."); }
    finally { setPending(false); }
  }
  return <Button className="profile-signout" variant="outline" disabled={pending} onClick={signOut}><LogOut size={16} />{pending ? (fa ? "در حال خروج…" : "Signing out…") : (fa ? "خروج از حساب کاربری" : "Sign out of your account")}</Button>;
}
