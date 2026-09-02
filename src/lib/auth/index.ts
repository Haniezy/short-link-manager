import { localAuthProvider } from "./local-auth";
import type { AuthProvider } from "./types";

/**
 * Single entry point for auth. Import `auth` from here everywhere else so the
 * concrete provider stays isolated. Currently wired to the local (no Neon)
 * provider; revert to `./neon-auth` to use Neon Auth.
 */
export const auth: AuthProvider = localAuthProvider;

export type { AuthUser, AuthSession } from "./types";
