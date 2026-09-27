import "server-only";
import { cookies, headers } from "next/headers";
import { extractNeonAuthCookies, type RequestContext } from "@neondatabase/auth/server";

// Read Next's mutable cookie store: after a Server Action rotates a session,
// headers() still contains the old token during the same response's RSC render.
export async function authRequestContext(): Promise<RequestContext> {
  const store = await cookies();
  const incoming = await headers();
  return {
    getCookies: () => extractNeonAuthCookies(new Headers({ cookie: store.toString() })),
    setCookie: (name, value, options) => { store.set(name, value, options); },
    getHeader: name => incoming.get(name),
    getOrigin: () => incoming.get("origin") || incoming.get("referer")?.split("/").slice(0, 3).join("/") || "",
    getFramework: () => "nextjs",
  };
}
