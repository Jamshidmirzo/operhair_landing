import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
  const logo = await readFile(
    join(process.cwd(), "public/brand/hayrli-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
          background: "#ffffff",
          color: "#0a0a0a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* The brand logo is dark ink on transparent, so the card is light. */}
        <img src={logoSrc} width={673 * 1.15} height={240 * 1.15} alt="" />
        <div
          style={{
            marginTop: 56,
            fontSize: 36,
            fontWeight: 400,
            color: "#52525b",
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
