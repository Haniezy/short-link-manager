import { neonAuthProvider } from "./neon-auth";
import { localAuthProvider } from "./local-auth";
import type { AuthProvider, AuthSession } from "./types";

/**
 * Auth provider selection:
 * - If Neon Auth env vars are present, use the Neon-backed provider.
 * - Otherwise, fall back to the local email/password provider.
 */
const provider: AuthProvider =
  process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET
    ? neonAuthProvider
    : localAuthProvider;

export const auth: AuthProvider = provider;

export async function getSession(): Promise<AuthSession | null> {
  return provider.getSession();
}

export async function signUp(input: {
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  return provider.signUp(input);
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  return provider.signIn(input);
}

export async function signOut(): Promise<{ error: string | null }> {
  return provider.signOut();
}

export type { AuthUser, AuthSession } from "./types";
