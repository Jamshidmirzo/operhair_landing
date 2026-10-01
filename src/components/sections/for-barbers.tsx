import { useTranslations } from "next-intl";
import { BarChart3, Bell, Calendar, Users } from "lucide-react";

import { ProLogo } from "@/components/layout/wordmark";
import { StoreBadge } from "@/components/store-badge";

import { PRO_SCREEN_RATIO, PRO_SCREENS, STORE_LINKS } from "./app-screens";
import { PartnerForm } from "./partner-form";
import { Reveal } from "./reveal";
import { ScreenShowcase } from "./screen-showcase";

const VALUE_PROPS = [
  { key: "calendar", Icon: Calendar },
  { key: "clients", Icon: Users },
  { key: "reminders", Icon: Bell },
  { key: "analytics", Icon: BarChart3 },
] as const;

/**
 * For Barbers — dark-themed counterpart to ForClients. Pitches the Hayrli Pro
 * CRM. Server-rendered text + small client islands for the reveal animation
 * and the partner inquiry form.
 */
export function ForBarbers() {
  const t = useTranslations("forBarbers");

  return (
    <section
      id="for-barbers"
      className="mx-2 rounded-[2rem] bg-[#0e0d12]/95 px-6 py-24 text-slate-100 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 sm:mx-4 sm:rounded-[3rem] sm:py-32 dark:bg-white/[0.04]"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <ProLogo height={64} className="mb-4 text-[#fffdfa]" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-4 font-sans font-light tracking-tight text-white"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.75rem)",
                lineHeight: 1.05,
              }}
            >
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base font-light text-slate-300 sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        {/* Value props */}
        <div className="mt-20">
          <Reveal>
            <h3 className="text-sm font-medium tracking-[0.2em] text-slate-400 uppercase">
              {t("valueProps.eyebrow")}
            </h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {VALUE_PROPS.map((vp, i) => (
              <Reveal key={vp.key} delay={0.1 + i * 0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-8 transition-transform duration-300 hover:-translate-y-1">
                  <vp.Icon
                    aria-hidden
                    className="size-6 text-white"
                    strokeWidth={1.5}
                  />
                  <h4 className="mt-6 text-lg font-medium text-white">
                    {t(`valueProps.items.${vp.key}.title`)}
                  </h4>
                  <p className="mt-2 text-sm font-light text-slate-300">
                    {t(`valueProps.items.${vp.key}.description`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        <div className="mt-24">
          <Reveal>
            <h3 className="text-sm font-medium tracking-[0.2em] text-slate-400 uppercase">
              {t("screens.eyebrow")}
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <ScreenShowcase
              tone="dark"
              className="mt-10"
              ratio={PRO_SCREEN_RATIO}
              screens={PRO_SCREENS.map((screen) => ({
                src: screen.src,
                label: t(`screens.items.${screen.key}`),
              }))}
            />
          </Reveal>
        </div>

        {/* CTA — partner form */}
        <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <h3
                className="font-sans font-light tracking-tight text-white"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 3rem)",
                  lineHeight: 1.05,
                }}
              >
                {t("form.title")}
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-base font-light text-slate-300">
                {t("form.subtitle")}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <PartnerForm />
          </Reveal>
        </div>

        {/* Download Hayrli Pro */}
        <div className="mt-24 flex flex-col items-center text-center">
          <Reveal>
            <ProLogo height={88} className="mb-8 text-[#fffdfa]" />
          </Reveal>
          <Reveal delay={0.05}>
            <h3
              className="font-sans font-light tracking-tight text-white"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                lineHeight: 1.05,
              }}
            >
              {t("download.title")}
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-md text-base font-light text-slate-300">
              {t("download.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <StoreBadge
                store="apple"
                tone="light"
                href={STORE_LINKS.pro.apple}
                small={t("download.appStoreSmall")}
                big="App Store"
              />
              <StoreBadge
                store="google"
                tone="light"
                href={STORE_LINKS.pro.google}
                small={t("download.googlePlaySmall")}
                big="Google Play"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
