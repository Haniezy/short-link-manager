import { AuthScreen } from "@/components/auth/auth-screen";
import { safeReturnPath } from "@/lib/validation";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AuthScreen mode="signup" next={safeReturnPath((await searchParams).next, "/dashboard")} />;
}
