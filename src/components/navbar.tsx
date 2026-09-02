import Link from "next/link";
import { Forward } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { AuthButtons } from "@/components/auth-buttons";

export async function Navbar() {
  const session = await auth.getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_2px_8px_-2px_oklch(0.575_0.205_294/0.5)]">
            <Forward className="size-4" strokeWidth={2.5} />
          </span>
          <span>ShortLink</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <UserMenu email={user.email} />
          ) : (
            <AuthButtons />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
