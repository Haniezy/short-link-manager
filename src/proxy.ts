import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";

export async function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some(({ name }) => name.endsWith("session_token"));
  if (!hasSession) return NextResponse.redirect(new URL("/login?notice=required", request.url));
  try {
    return await getAuth().middleware({ loginUrl: "/login?notice=required" })(request);
  } catch {
    return NextResponse.redirect(new URL("/login?notice=unavailable", request.url));
  }
}
export const config = { matcher: ["/dashboard/:path*"] };
