"use server";

import { auth } from "@/lib/auth";
import { ok, err, type ActionResult, type FieldErrors } from "@/lib/result";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(email: string, password: string): FieldErrors | null {
  const fe: FieldErrors = {};
  if (!EMAIL_RE.test(email)) fe.email = "Enter a valid email address.";
  if (password.length < 8) fe.password = "Password must be at least 8 characters.";
  return Object.keys(fe).length > 0 ? fe : null;
}

export type AuthSuccess = { kind: "signed-in" } | { kind: "signed-up" };

export async function signUpAction(
  _prev: ActionResult<AuthSuccess>,
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateCredentials(email, password);
  if (fieldErrors) return err("Please fix the errors below.", fieldErrors);

  const { error } = await auth.signUp({ email, password });
  if (error) {
    // Provider-side errors (duplicate email, etc.) → bind to email when the
    // message mentions it, otherwise surface as a form-level message.
    if (/already exists/i.test(error)) {
      return err("Please fix the errors below.", { email: error });
    }
    return err(error);
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
  if (fieldErrors) return err("Please fix the errors below.", fieldErrors);

  const { error } = await auth.signIn({ email, password });
  if (error) return err(error);

  return ok({ kind: "signed-in" });
}

export async function signOutAction(): Promise<void> {
  await auth.signOut();
  // The client navigates so we don't need to redirect here.
}