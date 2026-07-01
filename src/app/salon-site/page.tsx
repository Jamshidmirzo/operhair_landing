import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Clock, Scissors, ChevronRight } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_HAYRLI_API_BASE ?? "https://api.hayrli.app";

// ── Types ────────────────────────────────────────────────────────────────────

type SiteService = { name: string; description: string };

type SiteContent = {
  heading?: string;
  subheading?: string;
  about?: string;
  services?: SiteService[];
  cta?: { title?: string; button?: string };
  style?: string;
};

type Salon = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  tagline: string | null;
  working_hours: Record<string, unknown>;
  site_content: SiteContent;
};

// ── Data fetching ────────────────────────────────────────────────────────────

async function getSalon(slug: string): Promise<Salon | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/salons/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Salon;
  } catch {
    return null;
  }
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  if (!slug) return { title: "Hayrli" };

  const salon = await getSalon(slug);
  if (!salon) return { title: "Hayrli" };

  const title = `${salon.name} — Hayrli`;
  const description =
    salon.site_content.subheading ??
    salon.tagline ??
    salon.description ??
    "Запись онлайн через Hayrli";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: salon.cover_url
        ? [salon.cover_url]
        : salon.avatar_url
          ? [salon.avatar_url]
          : ["/og.png"],
    },
  };
}

// ── Working hours helper ──────────────────────────────────────────────────────

const DAY_NAMES: Record<string, string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Вс",
};

function formatHours(hours: Record<string, unknown>): string | null {
  const entries = Object.entries(hours).filter(
    ([, v]) => v && typeof v === "object",
  );
  if (!entries.length) return null;

  // If all days have same open/close — show once
  const [, first] = entries[0] as [string, { open?: string; close?: string }];
  const allSame = entries.every(([, v]) => {
    const day = v as { open?: string; close?: string };
    return day.open === first.open && day.close === first.close;
  });

  if (allSame && first.open && first.close) {
    return `${first.open} – ${first.close}`;
  }

  return entries
    .map(([key, v]) => {
      const day = v as { open?: string; close?: string };
      return `${DAY_NAMES[key] ?? key}: ${day.open ?? "?"} – ${day.close ?? "?"}`;
    })
    .join(", ");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SalonSitePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;

  if (!slug) {
    return <NotFound />;
  }

  const salon = await getSalon(slug);
  if (!salon) {
    return <NotFound />;
  }

  const sc = salon.site_content ?? {};
  const heading = sc.heading ?? salon.name;
  const subheading = sc.subheading ?? salon.tagline ?? "";
  const about = sc.about ?? salon.description ?? "";
  const services: SiteService[] = sc.services ?? [];
  const ctaTitle = sc.cta?.title ?? "Запишитесь прямо сейчас";
  const ctaButton = sc.cta?.button ?? "Открыть в приложении";
  const hours = formatHours(salon.working_hours);
  const bookingLink = `hayrli://salon/${slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {salon.cover_url && (
          <Image
            src={salon.cover_url}
            alt={salon.name}
            fill
            className="object-cover opacity-30"
            unoptimized
            priority
          />
        )}
        <div className="relative z-10 w-full px-6 pb-10 pt-24">
          <div className="mx-auto max-w-2xl">
            {salon.avatar_url && (
              <Image
                src={salon.avatar_url}
                alt={salon.name}
                width={80}
                height={80}
                className="mb-4 size-20 rounded-full border-4 border-background object-cover shadow-lg"
                unoptimized
              />
            )}
            <h1 className="text-4xl font-bold tracking-tight">{heading}</h1>
            {subheading && (
              <p className="mt-2 text-lg text-muted-foreground">{subheading}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-12 px-6 py-12">
        {/* Info bar */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {(salon.city || salon.address) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {[salon.address, salon.city].filter(Boolean).join(", ")}
            </span>
          )}
          {salon.phone && (
            <a
              href={`tel:${salon.phone}`}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Phone className="size-4 shrink-0" />
              {salon.phone}
            </a>
          )}
          {hours && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" />
              {hours}
            </span>
          )}
        </div>

        {/* About */}
        {about && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">О нас</h2>
            <p className="leading-relaxed text-muted-foreground">{about}</p>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Услуги</h2>
            <ul className="space-y-3">
              {services.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4"
                >
                  <Scissors className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {s.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-2xl bg-primary/10 px-8 py-10 text-center">
          <h2 className="text-2xl font-bold">{ctaTitle}</h2>
          <a
            href={bookingLink}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            {ctaButton}
            <ChevronRight className="size-4" />
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            Откроется в приложении Hayrli
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            Страница создана через{" "}
            <a href="https://hayrli.app" className="underline">
              Hayrli
            </a>{" "}
            — платформу для барберов и салонов
          </p>
        </footer>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <section className="container mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Салон не найден
      </h1>
      <p className="text-muted-foreground">
        Страница этого салона не существует или была удалена.
      </p>
      <a
        href="https://hayrli.app"
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        На главную
      </a>
    </section>
  );
}
