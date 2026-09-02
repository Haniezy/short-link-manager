"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Trash2 } from "lucide-react";
import { deleteLinkAction } from "@/lib/actions/links";

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

  const onConfirm = () => {
    startTransition(async () => {
      const result = await deleteLinkAction(linkId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Link /r/${slug} deleted.`);
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
            aria-label={`Delete /r/${slug}`}
          />
        }
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-mono">/r/{slug}</span> will stop working and its
            click history will be removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}