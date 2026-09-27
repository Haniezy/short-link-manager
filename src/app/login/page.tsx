import { z } from "zod";
import { AuthScreen } from "@/components/auth/auth-screen";
import { safeReturnPath } from "@/lib/validation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const notice = z.enum(["required", "unavailable"]).safeParse(params.notice);
  return <AuthScreen mode="login" notice={notice.success ? notice.data : undefined} next={safeReturnPath(params.next, "/dashboard")} />;
}
