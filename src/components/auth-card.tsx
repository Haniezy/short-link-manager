import Link from "next/link";
import { Forward } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Card body used by both /login and /signup. Keeps the visual frame and copy
 * in one place so the two pages only diverge on the form `mode`.
 */
export function AuthCard({ mode }: { mode: "login" | "signup" }) {
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
          {isSignup ? "Create your account" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "Start shortening links in less than a minute."
            : "Log in to manage your short links."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode={mode} />
      </CardContent>
    </Card>
  );
}