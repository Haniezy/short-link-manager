import { z } from "zod";
import { AuthScreen } from "@/components/auth/auth-screen";
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const notice = z.enum(["required", "unavailable"]).safeParse((await searchParams).notice);
  return <AuthScreen mode="login" notice={notice.success ? notice.data : undefined} />;
}
