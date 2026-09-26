"use client";
import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/lib/locale";

export default function AvatarCrop({ source, locale, onCancel, onConfirm }: { source: string; locale: Locale; onCancel: () => void; onConfirm: (file: File) => void }) {
  const fa = locale === "fa";
  const [crop, setCrop] = useState({ x: 0, y: 0 }), [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function confirm() {
    if (!area || busy) return;
    setBusy(true); setError("");
    try {
      const image = new window.Image(); image.src = source; await image.decode();
      if (image.naturalWidth * image.naturalHeight > 16_000_000) throw new Error("Image too large");
      const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
      context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, 256, 256);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Encoding failed")), "image/webp", 0.85));
      onConfirm(new File([blob], "profile-photo.webp", { type: blob.type }));
    } catch { setError(fa ? "برش این عکس ممکن نشد؛ عکس دیگری با ابعاد کوچک‌تر انتخاب کنید." : "Could not crop this photo. Try a smaller image."); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onCancel(); }}><DialogContent className="avatar-crop-dialog" showCloseButton={!busy}><DialogTitle>{fa ? "تنظیم عکس پروفایل" : "Adjust profile photo"}</DialogTitle><DialogDescription>{fa ? "عکس را جابه‌جا کنید و بزرگ‌نمایی را تنظیم کنید تا قسمت دلخواه داخل دایره قرار بگیرد." : "Drag the photo and adjust zoom to fit the part you want inside the circle."}</DialogDescription><div className="avatar-crop-stage" dir="ltr"><Cropper image={source} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropAreaChange={(_, pixels) => setArea(pixels)} onCropComplete={(_, pixels) => setArea(pixels)} mediaProps={{ onError: () => setError(fa ? "این فایل تصویر قابل‌خواندن نیست." : "This image could not be read.") }} /></div><div className="avatar-crop-zoom"><Label htmlFor="avatar-zoom">{fa ? "بزرگ‌نمایی" : "Zoom"}</Label><Input id="avatar-zoom" type="range" min={1} max={3} step={0.01} value={zoom} disabled={busy} onChange={event => setZoom(Number(event.target.value))} /></div>{error && <p className="dashboard-field-error" role="alert">{error}</p>}<DialogFooter><Button variant="outline" disabled={busy} onClick={onCancel}>{fa ? "انصراف" : "Cancel"}</Button><GlassButton disabled={!area || busy} onClick={confirm}>{busy ? (fa ? "در حال برش…" : "Cropping…") : (fa ? "تأیید برش" : "Use this crop")}</GlassButton></DialogFooter></DialogContent></Dialog>;
}
