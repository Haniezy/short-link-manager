import { z } from "zod";

export const profileSchema = z.object({ name: z.string().trim().min(1, "Name is required.").max(80, "Use at most 80 characters.") });
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(128),
  newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
  confirmPassword: z.string().min(1, "Confirm your new password.").max(128),
}).refine(v => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." })
  .refine(v => v.currentPassword !== v.newPassword, { path: ["newPassword"], message: "Choose a different password." });
