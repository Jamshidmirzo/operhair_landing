import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Baseline security headers. SAMEORIGIN (not DENY) on the landing page so it
// can still be previewed in our own admin/preview iframes if needed.
// Strict CSP intentionally omitted for now — requires per-page testing
// (inline JSON-LD, next/script, Yandex/Google analytics) before enabling.
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        // Route any {slug}.hayrli.app request to the salon-site page
        source: "/:path*",
        has: [{ type: "host", value: "(?<slug>[a-z0-9-]+)\\.hayrli\\.app" }],
        destination: "/salon-site?slug=:slug",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // DLINK-001: Apple requires the AASA file to be served as
        // `application/json` with no redirects. The file is extensionless
        // (per Apple's spec), so Vercel/Next would otherwise default to
        // `application/octet-stream` — which iOS silently rejects.
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        // Android App Links — assetlinks.json is a real JSON file with a
        // proper extension, but we set the header explicitly so the
        // Cache-Control matches the AASA neighbour and to defend against
        // any future MIME-detection tweaks on the platform.
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
