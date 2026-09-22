"use client";
import { useState } from "react";
import { Link2, ArrowLeft, ArrowRight, Copy, Check, Sparkles, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useLandingSession } from "./session";
import { copy } from "@/lib/locale";
import { destinationSchema } from "@/lib/validation";
import { createLinkAction } from "@/actions/links";
import { getShortUrl } from "@/lib/short-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Shortener() {
  const { locale, email, openAuth } = useLandingSession(), t = copy[locale];
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  async function create(value: string) {
    setPending(true); setError("");
    try {
      const response = await createLinkAction({ longUrl: value });
      if (response.error || !response.data) { setError(t.createError); toast.error(t.createError); return; }
      setResult(getShortUrl(response.data.link.slug)); setCopied(false);
      toast.success(t.result);
    } catch { setError(t.generalError); toast.error(t.generalError); }
    finally { setPending(false); }
  }
  async function submit() {
    const parsed = destinationSchema.safeParse(url);
    if (!parsed.success) { setError(t.urlError); return; }
    setError("");
    if (!email) {
      openAuth("signup");
    } else await create(parsed.data);
  }
  async function copyResult() {
    try { await navigator.clipboard.writeText(result); setCopied(true); toast.success(t.copied); }
    catch { toast.error(t.copyError); }
  }
  return <div className="shortener-card">
    <div className="shortener-title"><span><Sparkles size={15} />{t.formTitle}</span><span className="little-label">LinkFlow</span></div>
    <form action={submit} className="shortener-form">
      <div className="url-input-wrap"><Link2 size={18} aria-hidden="true" /><Input aria-label={t.urlLabel} aria-invalid={!!error} aria-describedby={error ? "url-error" : "url-help"} name="longUrl" dir="ltr" type="url" placeholder="https://your-very-long-link.com/something-great" value={url} onChange={(event) => { setUrl(event.target.value); setError(""); }} required disabled={pending} /></div>
      <Button type="submit" className="purple-button shorten-button" disabled={pending}>{pending ? t.shortening : t.shorten}{locale === "fa" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Button>
    </form>
    {error && <p className="form-error" id="url-error" role="alert">{error}</p>}
    {result ? <div className="shortener-result" role="status"><span className="result-check"><Check size={15} /></span><a href={result} target="_blank" rel="noreferrer" dir="ltr">{result}</a><Button variant="ghost" size="icon" aria-label={t.copy} onClick={copyResult}>{copied ? <Check size={17} /> : <Copy size={17} />}</Button></div> :
      <p className="shortener-hint" id="url-help"><LockKeyhole size={12} />{email ? t.formNote : t.authNote}</p>}
  </div>;
}
