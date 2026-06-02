import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LenisProvider } from "@/components/lenis-provider";
import { PageTracker } from "@/components/page-tracker";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { routing } from "@/i18n/routing";

import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const SITE_URL = "https://hayrli.uz";

const OG_LOCALE_MAP: Record<string, string> = {
  ru: "ru_RU",
  uz: "uz_UZ",
  en: "en_US",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const url = `/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: "%s | Hayrli",
      default: title,
    },
    description,
    alternates: {
      canonical: url,
      languages: {
        ru: "/ru",
        uz: "/uz",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Hayrli",
      locale: OG_LOCALE_MAP[locale] ?? "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hayrli",
    url: SITE_URL,
    logo: `${SITE_URL}/og.png`,
    sameAs: [],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale}>
            <LenisProvider />
            <PageTracker />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </body>
    </html>
  );
}
