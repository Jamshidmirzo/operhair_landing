import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

export const alt = "Hayrli";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "meta" });
  const description = t("description");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          hayrli
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 36,
            fontWeight: 400,
            color: "#cbd5e1",
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.3,
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
