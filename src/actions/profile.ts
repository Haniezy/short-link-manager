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
    const { error } = await getAuth().updateUser({ name: parsed.data.name, ...(parsed.data.image !== undefined ? { image: parsed.data.image || null } : {}) });
    if (error) return { data: null, error: "Could not save your profile." };
    revalidatePath("/", "layout");
    return { data: { saved: true }, error: null };
  } catch { return { data: null, error: "Could not save your profile." }; }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult<{ saved: true }>> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (!await getCurrentUser()) return { data: null, error: "Please sign in again." };
    const { error } = await getAuth().changePassword({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true });
    if (error) return { data: null, error: "Could not change your password. Check your current password and try again." };
    return { data: { saved: true }, error: null };
  } catch { return { data: null, error: "Could not change your password. Try again." }; }
}
