import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlProxy = createMiddleware(routing);

const SALON_HOST_RE = /^([a-z0-9-]+)\.hayrli\.app$/i;
// System subdomains that should never be treated as salon slugs
const SYSTEM_SUBDOMAINS = new Set(["admin", "api", "crm", "www", "mail", "app", "backend"]);

export function proxy(request: NextRequest): NextResponse {
  const hostname = request.nextUrl.hostname ?? "";
  const match = SALON_HOST_RE.exec(hostname);
  const slug = match?.[1] && !SYSTEM_SUBDOMAINS.has(match[1]) ? match[1] : undefined;

  if (slug) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/salon-site") {
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
  matcher: ["/((?!api|_next|_vercel|salon-site|.*\\..*).*)"],
};
