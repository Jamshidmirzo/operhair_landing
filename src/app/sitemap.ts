import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const SITE_URL = "https://hayrli.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 1.0,
    alternates: {
      languages,
    },
  }));
}
