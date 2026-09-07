"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteLinkAction } from "@/lib/actions/links";
import { useTranslations } from "next-intl";

export function ConfirmDelete({
  linkId,
  slug,
}: {
  linkId: string;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("confirmDelete");

  const onConfirm = () => {
    startTransition(async () => {
      const res = await deleteLinkAction(linkId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(t("deleted", { slug }));
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            aria-label={t("deleted", { slug })}
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-mono">/r/{slug}</span> — {t("desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}