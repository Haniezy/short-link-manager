"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { avatarFileSchema } from "@/lib/avatar-validation";
import { prepareAvatar } from "@/lib/avatar-image";
import { saveAvatar } from "@/lib/db/avatars";
import type { ActionResult } from "./types";
export async function updateAvatarAction(input: FormData): Promise<ActionResult<{ image: string | null }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "Please sign in again." };
    if (!(input instanceof FormData)) return { data: null, error: "Invalid upload." };
    const mode = z.enum(["upload", "remove"]).safeParse(input.get("mode"));
    if (!mode.success) return { data: null, error: "Invalid upload." };
    let photo: Buffer | null = null;
    if (mode.data === "upload") {
      const file = avatarFileSchema.safeParse(input.get("photo"));
      if (!file.success) return { data: null, error: file.error.issues[0].message };
      try { photo = await prepareAvatar(file.data); }
      catch { return { data: null, error: "Could not read this photo. Choose another JPG, PNG or WebP." }; }
    }
    const image = await saveAvatar(user.id, photo);
    revalidatePath("/", "layout");
    return { data: { image }, error: null };
  } catch { return { data: null, error: "Could not save your photo. Try again." }; }
}
