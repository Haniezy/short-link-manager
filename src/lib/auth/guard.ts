import { redirect } from "next/navigation";
import { auth, type AuthSession } from "./index";

/**
 * Returns the current session or redirects unauthenticated users to /login.
 * Use at the top of protected Server Components (e.g. /dashboard).
 */
export async function requireSession(): Promise<AuthSession> {
  const session = await auth.getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
