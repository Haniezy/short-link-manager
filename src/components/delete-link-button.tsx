"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
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
import { Trash2 } from "lucide-react";
import { deleteLinkAction } from "@/lib/actions/links";
import { useTranslations } from "next-intl";

/**
 * Client-side confirm-and-delete button. Used on the link-detail page so the
 * user can remove a link without bouncing back to /dashboard. Returns to the
 * dashboard on success.
 */
export function DeleteLinkButton({
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
      const result = await deleteLinkAction(linkId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("deleted", { slug }));
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={t("deleted", { slug })}
          />
        }
      >
        <Trash2 className="h-4 w-4" />
        {t("delete")}
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