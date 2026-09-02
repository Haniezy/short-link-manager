"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, LayoutDashboard } from "lucide-react";
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

function SignOutItem() {
  const { pending } = useFormStatus();
  return (
    <DropdownMenuItem
      nativeButton
      render={<button type="submit" disabled={pending} />}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </DropdownMenuItem>
  );
}

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-2 px-2" aria-label="Account menu" />
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
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form
            action={async () => {
              try {
                await signOutAction();
                toast.success("Signed out");
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : "Could not sign out",
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
