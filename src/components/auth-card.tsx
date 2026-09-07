import { Forward } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

/**
 * Card body used by both /login and /signup. Keeps the visual frame and copy
 * in one place so the two pages only diverge on the form `mode`.
 */
export async function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const t = await getTranslations("auth");
  const isSignup = mode === "signup";
  return (
    <Card className="card-glow border-primary/20 bg-card/80 backdrop-blur-xl">
      <CardHeader className="items-center text-center sm:items-start sm:text-left">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_2px_8px_-2px_oklch(0.575_0.205_294/0.5)]">
            <Forward className="size-4" strokeWidth={2.5} />
          </span>
          <span>ShortLink</span>
        </Link>
        <CardTitle className="text-2xl">
          {isSignup ? t("signup") : t("login")}
        </CardTitle>
        <CardDescription>
          {isSignup ? t("signupDesc") : t("loginDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode={mode} />
      </CardContent>
    </Card>
  );
}
