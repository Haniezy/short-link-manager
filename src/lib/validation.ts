import { z } from "zod";

/**
 * Server-side validation for creating a short link.
 * - destinationUrl: must be a valid http(s) URL
 * - slug: optional; alphanumeric and dashes only (3–32 characters)
 * - title: optional, trimmed, maximum 120 characters
 */
export const createLinkSchema = z.object({
  destinationUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "URL must start with http:// or https://",
    }),

  slug: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Slug may only contain letters, numbers, and dashes.",
    )
    .min(3, "Slug must be at least 3 characters.")
    .max(32, "Slug must be at most 32 characters.")
    .optional()
    .or(z.literal("")),

  title: z
    .string()
    .trim()
    .max(120, "Title must be at most 120 characters.")
    .optional()
    .or(z.literal("")),
});

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export const linkIdSchema = z
  .string()
  .uuid("Invalid link ID.");

export type CreateLinkInput = z.infer<typeof createLinkSchema>;