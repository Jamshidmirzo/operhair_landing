import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Backend public master card endpoint.
 *
 * Surface lives on the canonical API host. Falls back to the dev host when the
 * env var is not configured (e.g. local previews).
 */
const API_BASE =
  process.env.NEXT_PUBLIC_HAYRLI_API_BASE ?? "https://api.hayrli.app";

type MasterCard = {
  id: string;
  name: string;
  avatar_url?: string | null;
  city?: string | null;
  salon_name?: string | null;
  specializations?: string[] | null;
  rating_avg?: number | null;
  rating_count?: number | null;
};

async function getMasterCard(id: string): Promise<MasterCard | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/masters/${id}/card`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as MasterCard;
  } catch {
    return null;
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const master = await getMasterCard(id);
  if (!master) {
    return { title: "Hayrli" };
  }

  const description =
    master.salon_name ?? master.city ?? "Запись онлайн через Hayrli";

  return {
    title: `${master.name} — Hayrli`,
    description,
    openGraph: {
      title: `${master.name} — Hayrli`,
      description: "Записывайтесь онлайн через Hayrli",
      images: master.avatar_url ? [master.avatar_url] : ["/og.png"],
    },
  };
}

export default async function MasterFallbackPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("masterPage");
  const master = await getMasterCard(id);

  if (!master) {
    return (
      <section className="container mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("notFound.title")}
        </h1>
        <p className="text-muted-foreground">{t("notFound.description")}</p>
        <Link
          href={`/${locale}`}
          className={cn(buttonVariants({ size: "lg" }), "px-6")}
        >
          {t("notFound.cta")}
        </Link>
      </section>
    );
  }

  const rating = master.rating_avg ?? 0;
  const reviewCount = master.rating_count ?? 0;
  const specs = (master.specializations ?? []).filter((s) => s.length > 0);
  const deeplink = `hayrli://master/${id}`;

  return (
    <section className="container mx-auto max-w-md px-4 py-12">
      <div className="flex flex-col items-center text-center">
        {master.avatar_url ? (
          <Image
            src={master.avatar_url}
            alt={master.name}
            width={120}
            height={120}
            className="size-[120px] rounded-full object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="flex size-[120px] items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary">
            {initialsOf(master.name)}
          </div>
        )}

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {master.name}
        </h1>

        {reviewCount > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span aria-hidden className="text-amber-400">
              ★
            </span>
            <span className="font-medium text-foreground">
              {rating.toFixed(1)}
            </span>
            <span>
              ({t("reviewCount", { count: reviewCount })})
            </span>
          </p>
        )}

        {(master.city || master.salon_name) && (
          <p className="mt-2 text-sm text-muted-foreground">
            {[master.salon_name, master.city].filter(Boolean).join(" · ")}
          </p>
        )}

        {specs.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {specs.map((spec) => (
              <span
                key={spec}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <a
          href={deeplink}
          className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full px-6")}
        >
          {t("openInApp")}
        </a>

        <p className="mt-4 text-xs text-muted-foreground">
          {t("storeHelper")}
        </p>

        <div className="mt-3 grid w-full grid-cols-2 gap-3">
          <a
            href="https://apps.apple.com/uz/app/hayrli/id0000000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted"
          >
            App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=uz.hayrli.client"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted"
          >
            Google Play
          </a>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
