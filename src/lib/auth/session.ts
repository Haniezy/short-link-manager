import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "./server";

export const getCurrentUser = cache(async () => {
  const { data, error } = await getAuth().getSession({ query: { disableCookieCache: "true" } });
  if (error) throw new Error("Authentication is temporarily unavailable.");
  if (!data?.user) return null;
  return { id: data.user.id, email: data.user.email };
});

export async function requireUser() {
  let user;
  try { user = await getCurrentUser(); }
  catch { redirect("/login?notice=unavailable"); }
  if (!user) redirect("/login?notice=required");
  return user;
}
