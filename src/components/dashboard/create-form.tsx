"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassButton } from "@/components/ui/glass-button";
import { createLinkAction } from "@/actions/links";
import { createLinkSchema, validationError } from "@/lib/validation";
import type { Locale } from "@/lib/locale";

export function CreateLinkForm({ locale }: { locale: Locale }) {
  const fa = locale === "fa", router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({}), [pending, setPending] = useState(false);
  function errorText(name: string) {
    const error = errors[name]?.[0];
    if (!error) return null;
    const text = !fa ? error : name === "longUrl" ? "یک آدرس معتبر با http:// یا https:// وارد کنید (حداکثر ۲۰۴۸ کاراکتر)." : name === "title" ? "عنوان باید حداکثر ۱۲۰ کاراکتر باشد." : error === "Slug already taken." ? "این آدرس قبلاً استفاده شده؛ نام دیگری انتخاب کنید." : "حداکثر ۳۲ کاراکتر؛ فقط حروف انگلیسی، عدد و خط تیره.";
    return <p className="dashboard-field-error" id={`${name}-error`} role="alert">{text}</p>;
  }
  function props(name: string) { return { "aria-invalid": !!errors[name]?.length, "aria-describedby": errors[name]?.length ? `${name}-error` : undefined }; }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = event.currentTarget, data = new FormData(form);
    const input = { longUrl: data.get("longUrl"), customSlug: data.get("customSlug"), title: data.get("title") };
    const parsed = createLinkSchema.safeParse(input);
    if (!parsed.success) { setErrors(validationError(parsed.error).fieldErrors); return; }
    setErrors({}); setPending(true);
    try {
      const result = await createLinkAction(input);
      if (result.error || !result.data) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        else toast.error(fa ? "ساخت لینک انجام نشد؛ دوباره تلاش کنید." : "Could not create the link. Please try again.");
        return;
      }
      form.reset(); toast.success(fa ? "لینک کوتاه شما ساخته شد." : "Your short link is ready."); router.replace("/dashboard"); router.refresh();
    } catch { toast.error(fa ? "ساخت لینک انجام نشد؛ دوباره تلاش کنید." : "Could not create the link."); }
    finally { setPending(false); }
  }
  return <section className="dashboard-panel create-panel" id="create-link"><div className="dashboard-panel-heading"><h2><Link2 size={19} />{fa ? "یک لینک تازه بسازید" : "Create a new link"}</h2><span><Sparkles size={13} />{fa ? "کوتاه، خوانا، به‌یادماندنی" : "Short. Simple. Memorable."}</span></div>
    <form noValidate onSubmit={submit} aria-busy={pending} onChange={(event) => { if (event.target instanceof HTMLInputElement) { const name = event.target.name; setErrors(current => ({ ...current, [name]: [] })); } }}>
      <div className="create-fields"><div className="destination-field"><Label htmlFor="longUrl">{fa ? "آدرس مقصد" : "Destination URL"}</Label><Input {...props("longUrl")} id="longUrl" name="longUrl" type="url" dir="ltr" placeholder="https://example.com/your-long-link" required maxLength={2048} disabled={pending} />{errorText("longUrl")}</div>
      <div><Label htmlFor="customSlug">{fa ? "آدرس دلخواه (اختیاری)" : "Custom slug (optional)"}</Label><Input {...props("customSlug")} id="customSlug" name="customSlug" dir="ltr" placeholder="your-story" maxLength={32} disabled={pending} />{errorText("customSlug")}</div>
      <div><Label htmlFor="title">{fa ? "عنوان (اختیاری)" : "Title (optional)"}</Label><Input {...props("title")} id="title" name="title" placeholder={fa ? "پروژهٔ جدید من" : "My new project"} maxLength={120} disabled={pending} />{errorText("title")}</div>
      <GlassButton type="submit" disabled={pending}><Plus size={17} />{pending ? (fa ? "در حال ساخت…" : "Creating…") : (fa ? "ساخت لینک" : "Create link")}</GlassButton></div>
      <p className="create-hint">{fa ? "آدرس دلخواه را خالی بگذارید تا یک آدرس ۶ کاراکتری برایتان بسازیم." : "Leave the custom slug empty and we’ll generate a six-character one."}</p>
    </form></section>;
}
