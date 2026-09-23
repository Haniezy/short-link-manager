"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { deleteLinkAction } from "@/actions/links";
import type { Locale } from "@/lib/locale";

export function LinkControls({ id, url, slug, locale, detail = false }: { id: string; url: string; slug: string; locale: Locale; detail?: boolean }) {
  const fa = locale === "fa", router = useRouter();
  const [copied, setCopied] = useState(false), [open, setOpen] = useState(false), [pending, setPending] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); toast.success(fa ? "لینک کپی شد." : "Link copied."); }
    catch { toast.error(fa ? "کپی انجام نشد؛ دوباره تلاش کنید." : "Could not copy the link."); }
  }
  async function remove() {
    setPending(true);
    try {
      const result = await deleteLinkAction({ id });
      if (result.error) { toast.error(fa ? "حذف انجام نشد؛ دوباره تلاش کنید." : "Could not delete the link."); return; }
      setOpen(false); toast.success(fa ? "لینک حذف شد." : "Link deleted.");
      if (detail) router.replace("/dashboard");
      router.refresh();
    } catch { toast.error(fa ? "حذف انجام نشد؛ دوباره تلاش کنید." : "Could not delete the link."); }
    finally { setPending(false); }
  }
  return <div className="link-controls"><Button variant="ghost" size="icon" aria-label={fa ? "کپی لینک" : "Copy link"} onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</Button>
    <AlertDialog open={open} onOpenChange={(value) => { if (!pending) setOpen(value); }}><AlertDialogTrigger render={<Button variant="ghost" size="icon" className="delete-link" aria-label={fa ? "حذف لینک" : "Delete link"} />}><Trash2 size={16} /></AlertDialogTrigger>
      <AlertDialogContent><AlertDialogTitle>{fa ? "این لینک حذف شود؟" : "Delete this link?"}</AlertDialogTitle><AlertDialogDescription>{fa ? "لینک و آمار کلیک‌های آن حذف می‌شوند و قابل بازیابی نیستند." : "This permanently removes the link and its click history."}<span className="block mt-2 break-all" dir="ltr">/r/{slug}</span></AlertDialogDescription><AlertDialogFooter><AlertDialogCancel disabled={pending}>{fa ? "انصراف" : "Cancel"}</AlertDialogCancel><Button variant="destructive" disabled={pending} onClick={remove}>{pending ? (fa ? "در حال حذف…" : "Deleting…") : (fa ? "حذف لینک" : "Delete link")}</Button></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </div>;
}
