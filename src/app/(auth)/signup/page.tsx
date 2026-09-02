import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";
import { AuthShell } from "@/components/auth-shell";

export default async function SignupPage() {
  const session = await auth.getSession();
  if (session) redirect("/dashboard");

  return (
    <AuthShell>
      <AuthCard mode="signup" />
    </AuthShell>
  );
}