"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Upload, Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { UserAvatar } from "@/components/site/user-avatar";
import { avatarFileSchema } from "@/lib/avatar-validation";
import { updateAvatarAction } from "@/actions/avatar";
import type { Locale } from "@/lib/locale";
const AvatarCrop = dynamic(() => import("./avatar-crop"), { ssr: false, loading: () => <div role="status" className="avatar-crop-loading">…</div> });

export function AvatarUpload({ image, name, locale }: { image: string | null; name: string; locale: Locale }) {
  const fa = locale === "fa", router = useRouter(), inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);
  function select(selected: File | undefined) {
    setError("");
    if (!selected) return;
    const parsed = avatarFileSchema.safeParse(selected);
    if (!parsed.success) { setError(fa ? "عکس JPG، PNG یا WebP با حجم حداکثر ۵۱۲ کیلوبایت انتخاب کنید." : parsed.error.issues[0].message); if (inputRef.current) inputRef.current.value = ""; return; }
    setSource(URL.createObjectURL(selected));
    if (inputRef.current) inputRef.current.value = "";
  }
  async function save(mode: "upload" | "remove") {
    if (pending || (mode === "upload" && !file)) return;
    setPending(true); setError("");
    const data = new FormData(); data.set("mode", mode); if (file) data.set("photo", file);
    try {
      const result = await updateAvatarAction(data);
      if (result.error) { const message = fa ? "ذخیرهٔ عکس انجام نشد؛ یک تصویر معتبر انتخاب کنید یا دوباره تلاش کنید." : result.error; setError(message); toast.error(message); return; }
      setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = "";
      toast.success(fa ? "عکس پروفایل به‌روز شد." : "Profile photo updated."); router.refresh();
    } catch { const message = fa ? "ذخیرهٔ عکس انجام نشد؛ دوباره تلاش کنید." : "Could not save your photo."; setError(message); toast.error(message); }
    finally { setPending(false); }
  }
  return <div className="profile-upload"><UserAvatar name={name || "?"} image={preview || image} size={64} /><div className="profile-upload-fields"><span className="profile-photo-label">{fa ? "عکس پروفایل" : "Profile photo"}</span><Input ref={inputRef} id="profile-photo" className="hidden" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={e => select(e.currentTarget.files?.[0])} /><Button type="button" variant="outline" size="icon" disabled={pending} onClick={() => inputRef.current?.click()} aria-label={fa ? "انتخاب عکس پروفایل" : "Choose profile photo"} title={fa ? "انتخاب عکس" : "Choose photo"} aria-describedby={error ? "photo-error" : "photo-hint"}><Paperclip size={20} /></Button><small id="photo-hint">{fa ? "JPG، PNG یا WebP؛ حداکثر ۵۱۲ کیلوبایت. عکس پس از ذخیره در هدر هم نمایش داده می‌شود." : "JPG, PNG or WebP, up to 512 KB. Save to update your header photo."}</small>{error && <p id="photo-error" className="dashboard-field-error" role="alert">{error}</p>}<div className="profile-upload-actions"><GlassButton type="button" disabled={!file || pending} onClick={() => save("upload")}><Upload size={15} />{pending ? (fa ? "لطفاً صبر کنید…" : "Please wait…") : (fa ? "ذخیرهٔ عکس" : "Save photo")}</GlassButton>{image && <Button type="button" variant="ghost" disabled={pending} onClick={() => save("remove")}><Trash2 size={15} />{fa ? "حذف عکس" : "Remove photo"}</Button>}</div></div>{source && <AvatarCrop key={source} source={source} locale={locale} onCancel={() => setSource(null)} onConfirm={cropped => { setFile(cropped); setPreview(URL.createObjectURL(cropped)); setSource(null); }} />}</div>;
}
