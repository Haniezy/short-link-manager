import { neonAuthProvider } from "./neon-auth";
import type { AuthProvider, AuthSession } from "./types";

// Neon Auth is the only authentication provider required by the project brief.
const provider: AuthProvider = neonAuthProvider;

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
