/**
 * Auth abstraction layer.
 *
 * The rest of the app depends ONLY on this contract — never on a concrete
 * auth SDK. This keeps Neon Auth isolated: if its package name or API changes,
 * only `neon-auth.ts` is touched. See README "Decisions I made".
 */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * The capabilities the app needs from any auth backend.
 */
export interface AuthProvider {
  getSession(): Promise<AuthSession | null>;
  signUp(input: SignUpInput): Promise<{ error: string | null }>;
  signIn(input: SignInInput): Promise<{ error: string | null }>;
  signOut(): Promise<{ error: string | null }>;
}
