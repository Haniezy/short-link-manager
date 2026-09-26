import { z } from "zod";

export const profileImageSchema = z.union([z.literal(""), z.string().max(2048).url("Enter a valid image URL.").refine(value => value.startsWith("https://"), "Use an HTTPS image URL.")]);

export const profileSchema = z.object({ name: z.string().trim().min(1, "Name is required.").max(80, "Use at most 80 characters."), image: profileImageSchema.optional() });
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(128),
  newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
  confirmPassword: z.string().min(1, "Confirm your new password.").max(128),
}).refine(v => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." })
  .refine(v => v.currentPassword !== v.newPassword, { path: ["newPassword"], message: "Choose a different password." });
