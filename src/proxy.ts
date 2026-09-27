import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { isUnauthenticatedError } from "@/lib/auth/errors";

/** The dashboard page the user asked for, so signing in can return them to their deep link. */
function requestedPath(request: NextRequest): string {
  const requested = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return requested.startsWith("/dashboard") ? requested : "/dashboard";
}

function loginUrl(request: NextRequest, notice: "required" | "unavailable"): string {
  const target = new URL("/login", request.url);
  target.searchParams.set("notice", notice);
  if (notice === "required") target.searchParams.set("next", requestedPath(request));
  return `${target.pathname}${target.search}`;
}

export async function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some(({ name }) => name.endsWith("session_token"));
  if (!hasSession) {
    return NextResponse.redirect(new URL(loginUrl(request, "required"), request.url));
  }
  try {
    return await getAuth().middleware({ loginUrl: loginUrl(request, "required") })(request);
  } catch (error) {
    // A rejected session is a signed-out state; only genuine failures are outages.
    const notice = isUnauthenticatedError(error) ? "required" : "unavailable";
    return NextResponse.redirect(new URL(loginUrl(request, notice), request.url));
  }
}
export const config = { matcher: ["/dashboard/:path*"] };
