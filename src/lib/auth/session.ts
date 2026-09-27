import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAvatarUrl } from "../db/avatars";
import { getAuth } from "./server";

export const getCurrentUser = cache(async () => {
  const { data, error } = await getAuth().getSession({ query: { disableCookieCache: "true" } });
  if (error) throw new Error("Authentication is temporarily unavailable.");
  if (!data?.user) return null;
  // A photo lookup must not invalidate an otherwise verified session.
  const avatar = await getAvatarUrl(data.user.id).catch(() => null);
  return { id: data.user.id, email: data.user.email, name: data.user.name, image: avatar === undefined ? data.user.image ?? null : avatar, emailVerified: data.user.emailVerified };
});

export async function requireUser() {
  let user;
  try { user = await getCurrentUser(); }
  catch { redirect("/login?notice=unavailable"); }
  if (!user) redirect("/login?notice=required");
  return user;
}
