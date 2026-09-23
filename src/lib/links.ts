import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardForUser, getClicksByDay, getLinkForUser, getLinksForUser } from "@/lib/db/queries";
import { dashboardPageSchema, linkIdSchema } from "@/lib/validation";
import type { ActionResult } from "@/actions/types";
import type { Link } from "@/lib/db/schema";
import type { ClickCountByDay } from "@/lib/db/queries";

export async function loadDashboard(): Promise<ActionResult<{ links: Link[] }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "You must be signed in to view your links." };
    return { data: { links: await getLinksForUser(user.id) }, error: null };
  } catch {
    return { data: null, error: "Could not load your links. Please try again." };
  }
}

export async function loadLinkDetails(id: unknown): Promise<ActionResult<{
  link: Link; clicksByDay: ClickCountByDay[];
}>> {
  const parsed = linkIdSchema.safeParse(id);
  if (!parsed.success) return { data: null, error: "Link not found." };
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "You must be signed in to view this link." };
    const link = await getLinkForUser(parsed.data, user.id);
    if (!link) return { data: null, error: "Link not found." };
    return { data: { link, clicksByDay: await getClicksByDay(link.id, user.id) }, error: null };
  } catch {
    return { data: null, error: "Could not load this link. Please try again." };
  }
}

export async function loadDashboardPage(input: unknown = "1") {
  const parsed = dashboardPageSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: "Invalid page." };
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: "You must be signed in to view your links." };
    return { data: await getDashboardForUser(user.id, parsed.data), error: null };
  } catch { return { data: null, error: "Could not load your links. Please try again." }; }
}
