import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
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
