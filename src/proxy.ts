import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlProxy = createMiddleware(routing);

// hostname is already stripped of port by nextUrl
const SALON_HOST_RE = /^([a-z0-9-]+)\.hayrli\.app$/i;

export function proxy(request: NextRequest): NextResponse {
  const hostname = request.nextUrl.hostname;
  const match = hostname.match(SALON_HOST_RE);

  if (match) {
    const slug = match[1];
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Skip rewrite if already on salon-site (avoid loop)
    if (pathname === "/salon-site") {
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
  // Exclude salon-site from matcher so intl doesn't touch it
  matcher: ["/((?!api|_next|_vercel|salon-site|.*\\..*).*)"],
};
