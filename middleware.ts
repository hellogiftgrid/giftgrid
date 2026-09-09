import { NextResponse, type NextRequest } from "next/server";

/*
 * GiftGrid middleware intentionally stays lightweight.
 *
 * Authentication and authorization are handled inside:
 *   - /dashboard server components/layouts
 *   - /api/admin/* route handlers
 *
 * We do not call Supabase from middleware because a network
 * auth lookup here can cause Vercel middleware invocation
 * timeouts before the application page is reached.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  if (host === "console.degiftgrid.com" && !isAuthRoute && !request.nextUrl.pathname.startsWith("/console")) {
    const url = request.nextUrl.clone();
    url.pathname = `/console${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }
  if (host === "community.degiftgrid.com" && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/community";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

/*
 * Only run middleware where it may eventually be useful.
 * Keeping the matcher narrow also reduces unnecessary
 * middleware executions.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
