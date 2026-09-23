"use server";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth/server";
import { loginSchema, registerFormSchema, validationError } from "@/lib/validation";
import type { ActionResult } from "./types";

type AuthData = { email: string; requiresEmailVerification: boolean };

export async function registerAction(input: unknown): Promise<ActionResult<AuthData>> {
  const parsed = registerFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const { data, error } = await getAuth().signUp.email({
      email: parsed.data.email, password: parsed.data.password, name: parsed.data.email.split("@")[0],
    });
    if (error || !data) return { data: null, error: "Could not create an account. Try signing in or use another email." };
    revalidatePath("/dashboard", "layout");
    return { data: { email: data.user.email, requiresEmailVerification: !data.token }, error: null };
  } catch {
    return { data: null, error: "Sign up is temporarily unavailable. Please try again." };
  }
}
export async function loginAction(input: unknown): Promise<ActionResult<AuthData>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const { data, error } = await getAuth().signIn.email(parsed.data);
    if (error || !data) return { data: null, error: "Could not sign in. Check your email, password and email verification." };
    revalidatePath("/dashboard", "layout");
    return { data: { email: data.user.email, requiresEmailVerification: false }, error: null };
  } catch {
    return { data: null, error: "Sign in is temporarily unavailable. Please try again." };
  }
}
export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    const { error } = await getAuth().signOut();
    if (error) return { data: null, error: "Could not sign out. Please try again." };
    revalidatePath("/dashboard", "layout");
    return { data: null, error: null };
  } catch {
    return { data: null, error: "Could not sign out. Please try again." };
  }
}
