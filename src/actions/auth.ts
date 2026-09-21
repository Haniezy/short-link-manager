"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
} from "@/lib/auth/session";

import type { ActionResult } from "./types";

const registerSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long."),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? issue.message : "Invalid input.";
}

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerAction(
  input: RegisterInput,
): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: firstIssue(parsed.error) };
  }

  const { email, password } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { data: null, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning();

    await createSession(user.id);

    return { data: { email: user.email }, error: null };
  } catch {
    return {
      data: null,
      error: "Something went wrong. Please try again.",
    };
  }
}

export type LoginInput = z.infer<typeof loginSchema>;

export async function loginAction(
  input: LoginInput,
): Promise<ActionResult<{ email: string }>> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: firstIssue(parsed.error) };
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { data: null, error: "Invalid email or password." };
    }

    await createSession(user.id);

    return { data: { email: user.email }, error: null };
  } catch {
    return {
      data: null,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    await destroySession();
    return { data: null, error: null };
  } catch {
    return { data: null, error: "Something went wrong. Please try again." };
  }
}