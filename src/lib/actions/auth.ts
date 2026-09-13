"use server";

import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { credentialsSchema } from "@/lib/validation";
import { ok, err, type ActionResult, type FieldErrors } from "@/lib/result";

async function validateCredentials(
  email: string,
  password: string,
): Promise<FieldErrors | null> {
  const t = await getTranslations("validation");
  const result = credentialsSchema.safeParse({ email, password });

  if (result.success) return null;

  const errors = result.error.flatten().fieldErrors;
  const fieldErrors: FieldErrors = {};

  if (errors.email?.[0]) {
    fieldErrors.email = t(errors.email[0]);
  }

  if (errors.password?.[0]) {
    fieldErrors.password = t(errors.password[0]);
  }

  return fieldErrors;
}

export type AuthSuccess = { kind: "signed-in" } | { kind: "signed-up" };

export async function signUpAction(
  _prev: ActionResult<AuthSuccess>,
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const t = await getTranslations("validation");
  const fieldErrors = await validateCredentials(email, password);

  if (fieldErrors) {
    return err(t("fixFields"), fieldErrors);
  }

  const { error } = await auth
    .signUp({ email, password })
    .catch(() => ({ error: "unavailable" }));

  if (error) {
    if (/already exists/i.test(error)) {
      return err(t("fixFields"), {
        email: t("emailExists"),
      });
    }

    return err(t("signupFailed"));
  }

  return ok({ kind: "signed-up" });
}

export async function signInAction(
  _prev: ActionResult<AuthSuccess>,
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const t = await getTranslations("validation");
  const fieldErrors = await validateCredentials(email, password);

  if (fieldErrors) {
    return err(t("fixFields"), fieldErrors);
  }

  const { error } = await auth
    .signIn({ email, password })
    .catch(() => ({ error: "unavailable" }));

  if (error) {
    return err(t("loginFailed"));
  }

  return ok({ kind: "signed-in" });
}

export async function signOutAction(): Promise<
  ActionResult<{ signedOut: true }>
> {
  const t = await getTranslations("validation");
  try {
    const { error } = await auth.signOut();
    return error
      ? err(t("signoutFailed"))
      : ok({ signedOut: true });
  } catch {
    return err(t("signoutFailed"));
  }
}
