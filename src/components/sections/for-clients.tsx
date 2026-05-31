import Image from "next/image";
import { useTranslations } from "next-intl";
import { Clock, History, MapPin, Star } from "lucide-react";

import { Reveal } from "./reveal";

const FEATURES = [
  { key: "geo", Icon: MapPin },
  { key: "reviews", Icon: Star },
  { key: "online", Icon: Clock },
  { key: "history", Icon: History },
] as const;

const SCREENS = [
  { key: "home", src: "/screenshots/client-home.png" },
  { key: "barber", src: "/screenshots/client-barber.png" },
  { key: "confirm", src: "/screenshots/client-confirm.png" },
] as const;

/**
 * For Clients — light-themed section pitching the Hayrli consumer app.
 * Server-rendered text and structure. Animations come from the small
 * `Reveal` client island which uses framer-motion's `whileInView`.
 */
export function ForClients() {
  const t = useTranslations("forClients");
  const tabs = useTranslations("tabs");

  return (
    <section
      id="for-clients"
      className="border-t border-border/60 bg-white px-6 py-24 sm:py-32"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className="font-sans font-light tracking-tight text-foreground"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.75rem)",
                  lineHeight: 1.05,
                }}
              >
                {t("title")}
              </h2>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium tracking-wide text-amber-800 uppercase">
                {tabs("comingSoon")}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base font-light text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <Reveal>
            <h3 className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {t("howItWorks.eyebrow")}
            </h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-slate-50 p-8">
                  <span
                    className="font-sans font-thin text-slate-300"
                    style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", lineHeight: 1 }}
                  >
                    {i + 1}
                  </span>
                  <h4 className="mt-6 text-lg font-medium text-foreground">
                    {t(`howItWorks.steps.${i}.title`)}
                  </h4>
                  <p className="mt-2 text-sm font-light text-muted-foreground">
                    {t(`howItWorks.steps.${i}.description`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <Reveal>
            <h3 className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {t("features.eyebrow")}
            </h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.key} delay={0.1 + i * 0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-white p-8">
                  <feat.Icon
                    aria-hidden
                    className="size-6 text-foreground"
                    strokeWidth={1.5}
                  />
                  <h4 className="mt-6 text-lg font-medium text-foreground">
                    {t(`features.items.${feat.key}.title`)}
                  </h4>
                  <p className="mt-2 text-sm font-light text-muted-foreground">
                    {t(`features.items.${feat.key}.description`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        <div className="mt-24">
          <Reveal>
            <h3 className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {t("screens.eyebrow")}
            </h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {SCREENS.map((screen, i) => (
              <Reveal key={screen.key} delay={0.1 + i * 0.1}>
                <figure className="flex flex-col items-center">
                  <div className="relative aspect-[9/19] w-[260px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/80 sm:w-full">
                    <Image
                      src={screen.src}
                      alt={t(`screens.items.${screen.key}`)}
                      fill
                      className="object-cover blur-[8px] scale-[1.02]"
                      sizes="(max-width: 640px) 260px, 33vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="rounded-full bg-white/90 px-5 py-2 text-xs font-semibold tracking-wide text-slate-800 uppercase shadow-lg backdrop-blur-sm">
                        {tabs("comingSoon")}
                      </span>
                    </div>
                  </div>
                  <figcaption className="mt-4 text-sm font-light text-muted-foreground">
                    {t(`screens.items.${screen.key}`)}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 flex flex-col items-center text-center">
          <Reveal>
            <h3
              className="font-sans font-light tracking-tight text-foreground"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                lineHeight: 1.05,
              }}
            >
              {t("cta.title")}
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <div
                aria-label={t("cta.appStoreAria")}
                className="flex h-14 w-56 cursor-not-allowed items-center justify-center gap-3 rounded-2xl bg-slate-400 px-5 text-white/80"
              >
                <AppleGlyph aria-hidden className="size-7 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-light tracking-wide text-slate-200 uppercase">
                    {tabs("comingSoon")}
                  </span>
                  <span className="text-base font-medium">
                    {t("cta.appStoreBig")}
                  </span>
                </span>
              </div>
              <div
                aria-label={t("cta.googlePlayAria")}
                className="flex h-14 w-56 cursor-not-allowed items-center justify-center gap-3 rounded-2xl bg-slate-400 px-5 text-white/80"
              >
                <PlayGlyph aria-hidden className="size-7 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-light tracking-wide text-slate-200 uppercase">
                    {tabs("comingSoon")}
                  </span>
                  <span className="text-base font-medium">
                    {t("cta.googlePlayBig")}
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Tiny inline glyphs for store badges. Kept inline so we don't ship more
   icons than needed. */
function AppleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.365 1.43c0 1.14-.46 2.21-1.21 3-.81.85-2.13 1.51-3.21 1.43-.13-1.13.43-2.32 1.18-3.07.83-.83 2.18-1.43 3.24-1.36zM20.5 17.27c-.55 1.27-.81 1.83-1.51 2.95-.97 1.55-2.34 3.49-4.04 3.5-1.51.02-1.9-.99-3.95-.97-2.05.01-2.48 1-4 .97-1.7-.02-3-1.77-3.97-3.32C.42 16.27-.27 11.13 1.6 8.31c1.34-2 3.43-3.18 5.4-3.18 2.01 0 3.27 1.1 4.94 1.1 1.62 0 2.61-1.1 4.94-1.1 1.76 0 3.62.96 4.94 2.62-4.34 2.39-3.62 8.6-1.32 9.52z" />
    </svg>
  );
}

function PlayGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.6 1.83c-.36.39-.6.97-.6 1.74v16.86c0 .77.24 1.35.6 1.74l8.4-9.17-8.4-9.17zM14.4 13.84l3.34-1.92c.6-.35.94-.81.94-1.34s-.34-.99-.94-1.34L14.4 7.32 12 9.94l2.4 2.62-2.4 2.62 2.4-1.34zM4.86 23.27c.41 0 .87-.13 1.36-.42l10.13-5.84-2.45-2.62L4.86 23.27zM4.86.74L13.9 9.13l2.45-2.62L6.22 1.16C5.73.87 5.27.74 4.86.74z" />
    </svg>
  );
}
