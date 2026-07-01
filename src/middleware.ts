import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Matches any subdomain of hayrli.app — e.g. "mysalon.hayrli.app"
// but NOT "hayrli.app" itself or "www.hayrli.app".
const SALON_HOST_RE = /^([a-z0-9-]+)\.hayrli\.app$/i;

export function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get("host") ?? "";
  const match = host.match(SALON_HOST_RE);

  if (match) {
    const slug = match[1];
    // Skip rewrites for internal Next.js paths
    const { pathname } = request.nextUrl;
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = "/salon-site";
    url.searchParams.set("slug", slug);
    return NextResponse.rewrite(url);
  }

  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
