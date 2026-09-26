"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuth } from "@/lib/auth/server";
import { profileSchema, passwordChangeSchema } from "@/lib/profile-validation";
import { validationError } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function updateProfileAction(input: unknown): Promise<ActionResult<{ saved: true }>> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (!await getCurrentUser()) return { data: null, error: "Please sign in again." };
    const { error } = await getAuth().updateUser({ name: parsed.data.name });
    if (error) return { data: null, error: "Could not save your profile." };
    revalidatePath("/", "layout");
    return { data: { saved: true }, error: null };
  } catch { return { data: null, error: "Could not save your profile." }; }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult<{ saved: true; requiresSignIn: boolean }>> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "Please sign in again." };
    const { error } = await getAuth().changePassword({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true });
    if (error) return { data: null, error: "Could not change your password. Check your current password and try again." };
    // Revocation can invalidate the current provider session as well. Establish a
    // fresh session through the SDK so Next.js receives the replacement cookies.
    let requiresSignIn = true;
    try {
      const session = await getAuth().signIn.email({ email: user.email, password: parsed.data.newPassword });
      requiresSignIn = !!session.error || !session.data;
    } catch { /* Password was changed; do not report a failed password mutation. */ }
    return { data: { saved: true, requiresSignIn }, error: null };
  } catch { return { data: null, error: "Could not change your password. Try again." }; }
}
