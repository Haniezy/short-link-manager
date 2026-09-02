import { createNeonAuth } from "@neondatabase/auth/next/server";
import type { AuthProvider, AuthSession, SignInInput, SignUpInput } from "./types";

/**
 * Neon Auth implementation of the AuthProvider contract.
 *
 * This is the ONLY file that knows about the concrete Neon Auth SDK. The rest
 * of the app imports from `./index`, so swapping providers would mean editing
 * only this module. See README "Decisions I made".
 *
 * Required env vars: NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET.
 */

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

/**
 * Neon Auth client. We deliberately do NOT throw at module load time — doing so
 * would break `next build` in environments where env vars are only present at
 * runtime (e.g. Vercel). Misconfiguration surfaces as a friendly error from the
 * auth methods instead.
 */
const neonAuth =
  baseUrl && cookieSecret
    ? createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } })
    : null;

const NOT_CONFIGURED = "Authentication is not configured. Set NEON_AUTH_* env vars.";

export const neonAuthProvider: AuthProvider = {
  async getSession(): Promise<AuthSession | null> {
    if (!neonAuth) return null;
    const { data: session } = await neonAuth.getSession();
    if (!session?.user) return null;
    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
      },
    };
  },

  async signUp(input: SignUpInput): Promise<{ error: string | null }> {
    if (!neonAuth) return { error: NOT_CONFIGURED };
    const res = await neonAuth.signUp.email({
      email: input.email,
      password: input.password,
      // Better Auth requires a display name on email sign-up; derive it from
      // the email local-part since the form only collects email + password.
      name: input.email.split("@")[0] || input.email,
    });
    if (res?.error) return { error: res.error.message ?? "Sign up failed" };
    return { error: null };
  },

  async signIn(input: SignInInput): Promise<{ error: string | null }> {
    if (!neonAuth) return { error: NOT_CONFIGURED };
    const res = await neonAuth.signIn.email({
      email: input.email,
      password: input.password,
    });
    if (res?.error) return { error: res.error.message ?? "Sign in failed" };
    return { error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    if (!neonAuth) return { error: NOT_CONFIGURED };
    const res = await neonAuth.signOut();
    if (res?.error) return { error: res.error.message ?? "Sign out failed" };
    return { error: null };
  },
};

/**
 * Exposed for the route handler at app/api/auth/[...path]/route.ts.
 * When Neon Auth is not configured, returns stub handlers that answer 503 at
 * request time (instead of throwing at module load, which breaks builds).
 */
export function neonAuthHandlers(): {
  GET: (request: Request, ctx: unknown) => Promise<Response>;
  POST: (request: Request, ctx: unknown) => Promise<Response>;
} {
  if (!neonAuth) {
    const stub = async () =>
      new Response(JSON.stringify({ error: NOT_CONFIGURED }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    return { GET: stub, POST: stub };
  }
  return neonAuth.handler() as {
    GET: (request: Request, ctx: unknown) => Promise<Response>;
    POST: (request: Request, ctx: unknown) => Promise<Response>;
  };
}
