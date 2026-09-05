"use server";

import { auth } from "@/lib/auth";
import { credentialsSchema } from "@/lib/validation";
import { ok, err, type ActionResult, type FieldErrors } from "@/lib/result";

function validateCredentials(
  email: string,
  password: string,
): FieldErrors | null {
  const result = credentialsSchema.safeParse({ email, password });

  if (result.success) return null;

  const errors = result.error.flatten().fieldErrors;
  const fieldErrors: FieldErrors = {};

  if (errors.email?.[0]) {
    fieldErrors.email = errors.email[0];
  }

  if (errors.password?.[0]) {
    fieldErrors.password = errors.password[0];
  }

  return fieldErrors;
}

export type AuthSuccess =
  | { kind: "signed-in" }
  | { kind: "signed-up" };

export async function signUpAction(
  _prev: ActionResult<AuthSuccess>,
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateCredentials(email, password);

  if (fieldErrors) {
    return err("Please fix the errors below.", fieldErrors);
  }

  const { error } = await auth.signUp({ email, password });

  if (error) {
    if (/already exists/i.test(error)) {
      return err("Please fix the errors below.", {
        email: "An account with this email already exists.",
      });
    }

    return err("Could not create your account. Please try again.");
  }

  return ok({ kind: "signed-up" });
}

export async function signInAction(
  _prev: ActionResult<AuthSuccess>,
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateCredentials(email, password);

  if (fieldErrors) {
    return err("Please fix the errors below.", fieldErrors);
  }

  const { error } = await auth.signIn({ email, password });

  if (error) {
    return err("Invalid email or password.");
  }

  return ok({ kind: "signed-in" });
}

export async function signOutAction(): Promise<void> {
  await auth.signOut();
}