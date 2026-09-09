"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, UserRound } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { useTranslations } from "next-intl";

function SignOutItem() {
  const { pending } = useFormStatus();
  const t = useTranslations("userMenu");
  return (
    <DropdownMenuItem
      nativeButton
      render={<button type="submit" disabled={pending} />}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? t("signingOut") : t("signOut")}
    </DropdownMenuItem>
  );
}

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const t = useTranslations("userMenu");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 px-2"
            aria-label={t("account")}
          />
        }
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-semibold uppercase">
          {email.charAt(0)}
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("dashboard")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserRound className="size-4" />
            {t("profile")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form
            action={async () => {
              try {
                const result = await signOutAction();
                if (result.error) {
                  toast.error(t("signOutFailed"));
                  return;
                }
                toast.success(t("signedOut"));
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : t("signOutFailed"),
                );
                return;
              }
              router.push("/login");
              router.refresh();
            }}
            className="contents"
          >
            <SignOutItem />
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
