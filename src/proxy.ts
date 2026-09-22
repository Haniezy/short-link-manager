import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { httpError } from "@/lib/http-error";

export async function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some(({ name }) => name.endsWith("session_token"));
  if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
  try {
    return await getAuth().middleware({ loginUrl: "/login" })(request);
  } catch {
    return httpError(503);
  }
}
export const config = { matcher: ["/dashboard/:path*"] };
