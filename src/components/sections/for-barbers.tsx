import { useTranslations } from "next-intl";
import { BarChart3, Bell, Calendar, Users } from "lucide-react";

import { PartnerForm } from "./partner-form";
import { Reveal } from "./reveal";

const VALUE_PROPS = [
  { key: "calendar", Icon: Calendar },
  { key: "clients", Icon: Users },
  { key: "reminders", Icon: Bell },
  { key: "analytics", Icon: BarChart3 },
] as const;

const SCREENS = ["dashboard", "schedule", "client"] as const;

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
      className="bg-slate-950 px-6 py-24 text-slate-100 sm:py-32"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.3em] text-slate-400 uppercase">
              {t("eyebrow")}
            </p>
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
                <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-8">
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
          <div className="mt-8 -mx-6 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex gap-6 sm:grid sm:grid-cols-3">
              {SCREENS.map((key, i) => (
                <Reveal key={key} delay={0.1 + i * 0.1}>
                  <figure className="flex w-[260px] shrink-0 flex-col items-center sm:w-auto">
                    <div
                      className="aspect-[9/19] w-full rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                      role="img"
                      aria-label={t(`screens.items.${key}`)}
                    />
                    <figcaption className="mt-4 text-sm font-light text-slate-400">
                      {t(`screens.items.${key}`)}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
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
      </div>
    </section>
  );
}
