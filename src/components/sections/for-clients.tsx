import { useTranslations } from "next-intl";
import { Clock, History, MapPin, Star } from "lucide-react";

import { BrandMark } from "@/components/layout/wordmark";
import { StoreBadge } from "@/components/store-badge";

import { CLIENT_SCREEN_RATIO, CLIENT_SCREENS, STORE_LINKS } from "./app-screens";
import { Reveal } from "./reveal";
import { ScreenShowcase } from "./screen-showcase";

const FEATURES = [
  { key: "geo", Icon: MapPin },
  { key: "reviews", Icon: Star },
  { key: "online", Icon: Clock },
  { key: "history", Icon: History },
] as const;

/**
 * For Clients — light-themed section pitching the Hayrli consumer app.
 * Server-rendered text and structure. Animations come from the small
 * `Reveal` client island which uses framer-motion's `whileInView`.
 */
export function ForClients() {
  const t = useTranslations("forClients");

  return (
    <section
      id="for-clients"
      className="border-t border-border/60 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>

            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#1b1a1f] text-[#fffdfa] shadow-lg ring-1 ring-black/5 dark:bg-[#fffdfa] dark:text-[#1b1a1f]">
                <BrandMark size={30} />
              </span>
            </div>
            <h2
              className="font-sans font-light tracking-tight text-foreground"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.75rem)",
                lineHeight: 1.05,
              }}
            >
              {t("title")}
            </h2>
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
                <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card/80 p-8 transition-transform duration-300 hover:-translate-y-1">
                  <span
                    className="font-sans font-thin text-muted-foreground/40"
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
                <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card/80 p-8 transition-transform duration-300 hover:-translate-y-1">
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
          <Reveal delay={0.1}>
            <ScreenShowcase
              className="mt-10"
              ratio={CLIENT_SCREEN_RATIO}
              screens={CLIENT_SCREENS.map((screen) => ({
                src: screen.src,
                label: t(`screens.items.${screen.key}`),
              }))}
            />
          </Reveal>
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
              <StoreBadge
                store="apple"
                href={STORE_LINKS.hayrli.apple}
                small={t("cta.appStoreSmall")}
                big={t("cta.appStoreBig")}
                ariaLabel={t("cta.appStoreAria")}
              />
              <StoreBadge
                store="google"
                href={STORE_LINKS.hayrli.google}
                small={t("cta.googlePlaySmall")}
                big={t("cta.googlePlayBig")}
                ariaLabel={t("cta.googlePlayAria")}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
