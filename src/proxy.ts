import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlProxy = createMiddleware(routing);

// Matches {slug}.hayrli.app but NOT hayrli.app itself
const SALON_HOST_RE = /^([a-z0-9-]+)\.hayrli\.app$/i;

export function proxy(request: NextRequest): NextResponse {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const match = host.match(SALON_HOST_RE);

  if (match) {
    const slug = match[1];
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

  return intlProxy(request) as NextResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
