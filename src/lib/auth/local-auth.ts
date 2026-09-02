import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import type { AuthProvider, AuthSession, SignInInput, SignUpInput } from "./types";
import { getUserByEmail, insertUser } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db/migrate";

/**
 * Local (no Neon) auth implementation of the AuthProvider contract.
 *
 * Users are stored in the local PGlite `users` table with bcrypt-hashed
 * passwords. The session is an httpOnly cookie holding a signed payload
 * (userId.email) so it cannot be tampered with. Signing uses HMAC-SHA256 with
 * LOCAL_AUTH_SECRET.
 *
 * Swap this module back to neon-auth.ts in src/lib/auth/index.ts to return to
 * the Neon-backed setup.
 */

const COOKIE_NAME = "shortlink_session";
const SECRET = process.env.LOCAL_AUTH_SECRET || "dev-insecure-secret-change-me";

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function sign(payload: string): string {
  return base64url(createHmac("sha256", SECRET).update(payload).digest());
}

function verify(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return fromBase64url(payload).toString("utf8");
}

async function setSessionCookie(userId: string, email: string) {
  const payload = base64url(JSON.stringify({ userId, email }));
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export const localAuthProvider: AuthProvider = {
  async getSession(): Promise<AuthSession | null> {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const raw = verify(token);
    if (!raw) return null;
    try {
      const { userId, email } = JSON.parse(raw);
      if (!userId || !email) return null;
      return { user: { id: userId, email } };
    } catch {
      return null;
    }
  },

  async signUp(input: SignUpInput): Promise<{ error: string | null }> {
    await ensureSchema();
    const email = input.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Enter a valid email address." };
    }
    if (input.password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return { error: "An account with this email already exists." };
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await insertUser({ email, passwordHash });
    await setSessionCookie(user.id, user.email);
    return { error: null };
  },

  async signIn(input: SignInInput): Promise<{ error: string | null }> {
    await ensureSchema();
    const email = input.email.trim().toLowerCase();
    const user = await getUserByEmail(email);
    if (!user) {
      return { error: "Invalid email or password." };
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      return { error: "Invalid email or password." };
    }
    await setSessionCookie(user.id, user.email);
    return { error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    await clearSessionCookie();
    return { error: null };
  },
};
