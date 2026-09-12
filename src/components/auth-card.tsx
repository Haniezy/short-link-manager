import { Forward } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/auth-form";
import { getTranslations } from "next-intl/server";

/**
 * Header + form body used by both /login and /signup. Keeps the logo and copy
 * in one place so the two pages only diverge on the form `mode`. Rendered
 * directly on the auth background (no card frame).
 */
export async function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const t = await getTranslations("auth");
  const isSignup = mode === "signup";
  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center sm:items-start sm:text-start">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_2px_8px_-2px_oklch(0.575_0.205_294/0.5)]">
            <Forward className="size-4" strokeWidth={2.5} />
          </span>
          <span>ShortLink</span>
        </Link>
        <h1 className="text-2xl font-semibold">
          {isSignup ? t("signup") : t("login")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignup ? t("signupDesc") : t("loginDesc")}
        </p>
      </div>
      <AuthForm mode={mode} />
    </>
  );
}
