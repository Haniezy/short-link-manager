import { z } from "zod";

export const slugSchema = z.string().min(1).max(32).regex(/^[a-zA-Z0-9-]+$/,
  "Slug can only contain letters, numbers and hyphens.");
export const linkIdSchema = z.uuid("Invalid link id.");
export const userIdSchema = z.string().min(1).max(255);
export const destinationSchema = z.string().trim().max(2048, "URL is too long.")
  .url("Enter a valid URL.")
  .refine((value) => /^https?:\/\//i.test(value),
    "URL must start with http:// or https://.");

export const createLinkSchema = z.object({
  longUrl: destinationSchema,
  customSlug: z.string().trim().pipe(z.union([slugSchema, z.literal("")])).optional()
    .transform((value) => value || null),
  title: z.string().trim().max(120, "Title must be at most 120 characters.")
    .optional().transform((value) => value || null),
});
export const deleteLinkSchema = z.object({ id: linkIdSchema });
const emailSchema = z.string().trim().toLowerCase().max(254, "Email is too long.").pipe(z.email("Enter a valid email address."));
export const registerSchema = z.object({
  email: emailSchema.refine(value => value.endsWith("@gmail.com"), "Please use a Gmail address ending in @gmail.com."),
  password: z.string().min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
});
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.").max(128, "Password is too long."),
});
export const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string().min(1, "Please re-enter your password.").max(128, "Password must be at most 128 characters."),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"], message: "Your passwords do not match.",
});
export function validationError(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { data: null, error: error.issues[0]?.message ?? "Invalid input.", fieldErrors };
}

export const dashboardPageSchema = z.coerce.number().int().min(1).max(1000000);
