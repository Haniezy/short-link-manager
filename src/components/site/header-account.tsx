"use client";
import { UserAvatar } from "./user-avatar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth";
import { copy, type Locale } from "@/lib/locale";

export function HeaderAccount({ locale, email, name, image }: { locale: Locale; email: string | null; name?: string | null; image?: string | null }) {
  const router = useRouter(), [pending, setPending] = useState(false), fa = locale === "fa";
  async function logout() {
    setPending(true);
    try {
      const result = await logoutAction();
      if (result.error) { toast.error(fa ? "خروج انجام نشد؛ دوباره تلاش کنید." : "Could not sign out. Please try again."); return; }
      toast.success(fa ? "از حساب خارج شدید." : "You signed out."); router.replace("/"); router.refresh();
    } catch { toast.error(fa ? "خروج انجام نشد؛ دوباره تلاش کنید." : "Could not sign out. Please try again."); }
    finally { setPending(false); }
  }
  if (!email) return <><Button variant="ghost" className="header-login" onClick={() => router.push("/login")}>{copy[locale].login}</Button><GlassButton className="header-signup" onClick={() => router.push("/signup")}>{copy[locale].signup}</GlassButton></>;
  return <><Link href="/dashboard" className="account-dashboard">{fa ? "داشبورد" : "Dashboard"}</Link><DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" className="account-profile" aria-label={fa ? "منوی حساب کاربری" : "Account menu"} />}><UserAvatar name={name || email} image={image} /><span className="account-name">{name || email.split("@")[0]}</span></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64"><DropdownMenuGroup><DropdownMenuLabel>{fa ? "حساب شما" : "Your account"}<span className="block truncate text-xs font-normal text-muted-foreground" dir="ltr">{email}</span></DropdownMenuLabel></DropdownMenuGroup><DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}><UserRound />{fa ? "پروفایل و تنظیمات" : "Profile & settings"}</DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push("/dashboard")}><LayoutDashboard />{fa ? "داشبورد لینک‌ها" : "Link dashboard"}</DropdownMenuItem>
      <DropdownMenuItem disabled={pending} onClick={logout}><LogOut />{pending ? (fa ? "در حال خروج…" : "Signing out…") : (fa ? "خروج از حساب" : "Sign out")}</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu></>;
}
