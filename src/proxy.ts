import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. The next-intl middleware
// factory still works as the proxy function — it returns a `(NextRequest) =>
// NextResponse` handler that the file convention expects.
export const proxy = createMiddleware(routing);

export const config = {
  // Match all paths except API, static assets, and metadata files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
