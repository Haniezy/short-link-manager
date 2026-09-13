"use server";

import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("validation");
  const session = await auth.getSession().catch(() => null);

  if (!session) {
    return err(t("session"));
  }

  const parsed = createLinkSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];

      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = t.has(issue.message) ? t(issue.message) : t("fixFields");
      }
    }

    return err(t("fixFields"), fieldErrors);
  }

  const {
    destinationUrl,
    slug: rawSlug,
    title,
  } = parsed.data;

  const requestedSlug = rawSlug?.trim()
    ? rawSlug.trim()
    : null;

  try {
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
          t("slugGenerate"),
        );
      }
    } else if (await isSlugTaken(slug)) {
      return err(t("slugTaken"), {
        slug: t("slugTakenHint"),
      });
    }

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
      t("createFailed"),
    );
  }
}

/**
 * Deletes a link only when it belongs to the current user.
 */
export async function deleteLinkAction(
  id: string,
): Promise<ActionResult<null>> {
  const t = await getTranslations("validation");
  const session = await auth.getSession().catch(() => null);

  if (!session) {
    return err(t("session"));
  }

  const parsedId = linkIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err(t("linkIdInvalid"));
  }

  try {
    const deleted = await deleteLinkById(
      parsedId.data,
      session.user.id,
    );

    if (!deleted) {
      return err(t("notFound"));
    }

    updateTag(LINKS_TAG);
    updateTag(linkTag(parsedId.data));

    return ok(null);
  } catch {
    return err(
      t("deleteFailed"),
    );
  }
}

/**
 * Returns every link belonging to the current user.
 */
export async function getLinksAction(): Promise<
  ActionResult<LinkWithClicks[]>
> {
  const t = await getTranslations("validation");
  const session = await auth.getSession().catch(() => null);

  if (!session) {
    return err(t("session"));
  }

  try {
    const links = await getLinksByUser(session.user.id);
    return ok(links);
  } catch {
    return err(
      t("loadFailed"),
    );
  }
}

/**
 * Returns one link only when it belongs to the current user.
 */
export async function getLinkAction(
  id: string,
): Promise<ActionResult<LinkWithClicks | null>> {
  const t = await getTranslations("validation");
  const session = await auth.getSession().catch(() => null);

  if (!session) {
    return err(t("session"));
  }

  const parsedId = linkIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err(t("linkIdInvalid"));
  }

  try {
    const link = await getLinkById(
      parsedId.data,
      session.user.id,
    );

    if (!link) {
      return err(t("notFound"));
    }

    return ok(link);
  } catch {
    return err(
      t("loadOneFailed"),
    );
  }
}