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
    .url("urlInvalid")
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "urlProtocol",
    }),

  slug: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "slugCharacters",
    )
    .min(3, "slugShort")
    .max(32, "slugLong")
    .optional()
    .or(z.literal("")),

  title: z
    .string()
    .trim()
    .max(120, "titleLong")
    .optional()
    .or(z.literal("")),
});

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "emailRequired")
    .email("emailInvalid"),

  password: z
    .string()
    .min(8, "passwordShort"),
});

export const linkIdSchema = z
  .string()
  .uuid("linkIdInvalid");

export type CreateLinkInput = z.infer<typeof createLinkSchema>;