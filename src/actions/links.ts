"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { links, type Link } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";

import type { ActionResult } from "./types";

const SLUG_MAX_LENGTH = 32;
const TITLE_MAX_LENGTH = 120;
const MAX_SLUG_ATTEMPTS = 4;

const createLinkSchema = z.object({
  longUrl: z
    .string({ message: "Destination URL is required." })
    .url("Enter a valid URL.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "URL must start with http:// or https://.",
    )
    .max(2048, "URL is too long."),
  customSlug: z
    .string()
    .trim()
    .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters.`)
    .regex(/^$|^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers and hyphens.")
    .optional()
    .transform((value) => (value ? value : null)),
  title: z
    .string()
    .trim()
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters.`)
    .optional()
    .transform((value) => (value ? value : null)),
});

const deleteLinkSchema = z.object({
  id: z.uuid("Invalid link id."),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;
type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? issue.message : "Invalid input.";
}

export async function createLinkAction(
  input: CreateLinkInput,
): Promise<ActionResult<{ link: Link }>> {
  const user = await getCurrentUser();

  if (!user) {
    return { data: null, error: "You must be signed in to create a link." };
  }

  const parsed = createLinkSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: firstIssue(parsed.error) };
  }

  const { longUrl, customSlug, title } = parsed.data;

  try {
    let slug = customSlug ?? generateSlug();

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const inserted = await db
        .insert(links)
        .values({
          userId: user.id,
          slug,
          destinationUrl: longUrl,
          title,
        })
        .onConflictDoNothing({ target: links.slug })
        .returning();

      const link = inserted[0];

      if (link) {
        return { data: { link }, error: null };
      }

      if (customSlug) {
        return { data: null, error: "Slug already taken." };
      }

      slug = generateSlug();
    }

    return {
      data: null,
      error: "Could not generate a unique slug. Please try again.",
    };
  } catch {
    return {
      data: null,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteLinkAction(
  input: DeleteLinkInput,
): Promise<ActionResult<null>> {
  const user = await getCurrentUser();

  if (!user) {
    return { data: null, error: "You must be signed in to delete a link." };
  }

  const parsed = deleteLinkSchema.safeParse(input);

  if (!parsed.success) {
    return { data: null, error: firstIssue(parsed.error) };
  }

  const { id } = parsed.data;

  try {
    const deleted = await db
      .delete(links)
      .where(and(eq(links.id, id), eq(links.userId, user.id)))
      .returning({ id: links.id });

    if (deleted.length === 0) {
      return { data: null, error: "Link not found." };
    }

    return { data: null, error: null };
  } catch {
    return {
      data: null,
      error: "Something went wrong. Please try again.",
    };
  }
}