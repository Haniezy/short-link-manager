import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";
import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage() {
  const session = await auth.getSession();
  if (session) redirect({ href: "/dashboard", locale: await getLocale() });

  return (
    <AuthShell>
      <AuthCard mode="login" />
    </AuthShell>
  );
}
