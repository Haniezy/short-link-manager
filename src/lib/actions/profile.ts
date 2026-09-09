"use server";

import { z } from "zod";
import { changeNeonPassword } from "@/lib/auth/neon-auth";
import { auth } from "@/lib/auth";
import { updateProfile } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

const schema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(400),
  avatarUrl: z.union([
    z.literal(""),
    z
      .url()
      .max(2048)
      .refine((value) => new URL(value).protocol === "https:"),
  ]),
});

export async function saveProfile(data: unknown) {
  const session = await auth.getSession().catch(() => null);
  if (!session) return { data: null, error: "session" };
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { data: null, error: "invalid" };
  try {
    await updateProfile(session.user.id, parsed.data);
    revalidatePath("/[locale]/profile", "page");
    return { data: { saved: true }, error: null };
  } catch {
    return { data: null, error: "failed" };
  }
}

const passwordSchema = z
  .object({
    current: z.string().min(1).max(128),
    next: z.string().min(8).max(128),
  })
  .refine((value) => value.current !== value.next);

export async function changeProfilePassword(current: unknown, next: unknown) {
  const session = await auth.getSession().catch(() => null);
  if (!session) return { data: null, error: "session" };
  const parsed = passwordSchema.safeParse({ current, next });
  if (!parsed.success) return { data: null, error: "passwordInvalid" };
  return changeNeonPassword(parsed.data.current, parsed.data.next);
}
