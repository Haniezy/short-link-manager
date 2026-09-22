"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteLinkForUser, insertLinkForUser } from "@/lib/db/queries";
import type { Link } from "@/lib/db/schema";
import { createLinkSchema, deleteLinkSchema, validationError } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function createLinkAction(input: unknown): Promise<ActionResult<{ link: Link }>> {
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "You must be signed in to create a link." };
    const link = await insertLinkForUser(user.id, parsed.data);
    if (!link) {
      return parsed.data.customSlug
        ? { data: null, error: "Slug already taken.", fieldErrors: { customSlug: ["Slug already taken."] } }
        : { data: null, error: "Could not generate a unique slug. Please try again." };
    }
    revalidatePath("/dashboard");
    return { data: { link }, error: null };
  } catch {
    return { data: null, error: "Could not create the link. Please try again." };
  }
}
export async function deleteLinkAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = deleteLinkSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "You must be signed in to delete a link." };
    if (!(await deleteLinkForUser(parsed.data.id, user.id))) return { data: null, error: "Link not found." };
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/links/${parsed.data.id}`);
    return { data: null, error: null };
  } catch {
    return { data: null, error: "Could not delete the link. Please try again." };
  }
}
