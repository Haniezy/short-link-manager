"use client";
import { createContext, useContext, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { copy, type Locale } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";

type SessionValue = { locale: Locale; email: string | null; openAuth: (mode?: "login" | "signup") => void };
const SessionContext = createContext<SessionValue | null>(null);
export function useLandingSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Landing session is unavailable.");
  return value;
}
export function LandingSession({ locale, initialEmail, children }: { locale: Locale; initialEmail: string | null; children: ReactNode }) {
  const router = useRouter();
  function openAuth(mode: "login" | "signup" = "signup") {
    router.push(mode === "login" ? "/login" : "/signup");
  }
  return <SessionContext.Provider value={{ locale, email: initialEmail, openAuth }}>{children}</SessionContext.Provider>;
}
export function AuthButton({ children, mode = "signup", className = "" }: { children: ReactNode; mode?: "login" | "signup"; className?: string }) {
  const { openAuth } = useLandingSession();
  return <Button onClick={() => openAuth(mode)} className={className}>{children}</Button>;
}
export function AccountButtons() {
  const { locale, openAuth } = useLandingSession(), t = copy[locale];
  return <>
    <Button variant="ghost" className="header-login" onClick={() => openAuth("login")}>{t.login}</Button>
    <GlassButton className="header-signup" onClick={() => openAuth("signup")}>{t.signup}<ArrowUpRight size={14} /></GlassButton>
  </>;
}
