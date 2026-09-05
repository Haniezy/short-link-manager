"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  ok,
  err,
  type ActionResult,
  type FieldErrors,
} from "@/lib/result";
import {
  createLinkSchema,
  linkIdSchema,
} from "@/lib/validation";
import {
  deleteLinkById,
  getLinkById,
  getLinksByUser,
  insertLink,
  isSlugTaken,
  type LinkWithClicks,
} from "@/lib/db/queries";
import { generateSlug } from "@/lib/slug";

const LINKS_TAG = "links";
const linkTag = (id: string) => `link:${id}`;

/**
 * Creates a short link for the currently authenticated user.
 */
export async function createLinkAction(input: {
  destinationUrl: string;
  slug?: string;
  title?: string;
}): Promise<ActionResult<LinkWithClicks>> {
  const session = await auth.getSession();

  if (!session) {
    return err("You must be signed in.");
  }

  const parsed = createLinkSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];

      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return err("Please fix the errors below.", fieldErrors);
  }

  const {
    destinationUrl,
    slug: rawSlug,
    title,
  } = parsed.data;

  const requestedSlug = rawSlug?.trim()
    ? rawSlug.trim()
    : null;

  let slug = requestedSlug;

  if (!slug) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateSlug(6);

      if (!(await isSlugTaken(candidate))) {
        slug = candidate;
        break;
      }
    }

    if (!slug) {
      return err(
        "Could not generate a unique slug. Please try again.",
      );
    }
  } else if (await isSlugTaken(slug)) {
    return err("That slug is already taken.", {
      slug: "That slug is already taken. Please choose another.",
    });
  }

  try {
    const link = await insertLink({
      userId: session.user.id,
      slug,
      destinationUrl,
      title: title?.trim() ? title.trim() : null,
    });

    updateTag(LINKS_TAG);

    return ok({
      ...link,
      clickCount: 0,
    });
  } catch {
    return err(
      "Something went wrong creating your link. Please try again.",
    );
  }
}

/**
 * Deletes a link only when it belongs to the current user.
 */
export async function deleteLinkAction(
  id: string,
): Promise<ActionResult<null>> {
  const session = await auth.getSession();

  if (!session) {
    return err("You must be signed in.");
  }

  const parsedId = linkIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err("Invalid link ID.");
  }

  try {
    const deleted = await deleteLinkById(
      parsedId.data,
      session.user.id,
    );

    if (!deleted) {
      return err("Link not found.");
    }

    updateTag(LINKS_TAG);
    updateTag(linkTag(parsedId.data));

    return ok(null);
  } catch {
    return err(
      "Could not delete the link. Please try again.",
    );
  }
}

/**
 * Returns every link belonging to the current user.
 */
export async function getLinksAction(): Promise<
  ActionResult<LinkWithClicks[]>
> {
  const session = await auth.getSession();

  if (!session) {
    return err("You must be signed in.");
  }

  try {
    const links = await getLinksByUser(session.user.id);
    return ok(links);
  } catch {
    return err(
      "Could not load your links. Please try again.",
    );
  }
}

/**
 * Returns one link only when it belongs to the current user.
 */
export async function getLinkAction(
  id: string,
): Promise<ActionResult<LinkWithClicks | null>> {
  const session = await auth.getSession();

  if (!session) {
    return err("You must be signed in.");
  }

  const parsedId = linkIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err("Invalid link ID.");
  }

  try {
    const link = await getLinkById(
      parsedId.data,
      session.user.id,
    );

    if (!link) {
      return err("Link not found.");
    }

    return ok(link);
  } catch {
    return err(
      "Could not load the link. Please try again.",
    );
  }
}