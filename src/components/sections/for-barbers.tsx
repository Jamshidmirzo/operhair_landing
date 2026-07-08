import Image from "next/image";
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

const SCREENS = [
  { key: "dashboard", src: "/screenshots/calendar.png" },
  { key: "schedule", src: "/screenshots/appointment.png" },
  { key: "client", src: "/screenshots/clients.png" },
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
      className="bg-slate-950 px-6 py-24 text-slate-100 sm:py-32 dark:bg-[#0a0a0a]"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/logo-hayrli-pro.jpg"
                alt="Hayrli Pro"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <p className="text-xs font-medium tracking-[0.3em] text-slate-400 uppercase">
                {t("eyebrow")}
              </p>
            </div>
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
              {SCREENS.map((screen, i) => (
                <Reveal key={screen.key} delay={0.1 + i * 0.1}>
                  <figure className="flex w-[260px] shrink-0 flex-col items-center sm:w-auto">
                    <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                      <Image
                        src={screen.src}
                        alt={t(`screens.items.${screen.key}`)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 260px, 33vw"
                      />
                    </div>
                    <figcaption className="mt-4 text-sm font-light text-slate-400">
                      {t(`screens.items.${screen.key}`)}
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

        {/* Download Hayrli Pro */}
        <div className="mt-24 flex flex-col items-center text-center">
          <Reveal>
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
              <a
                href="https://play.google.com/store/apps/details?id=flek.hayrli.pro.app"
                target="_blank"
                rel="noreferrer"
                className="flex h-14 w-56 items-center justify-center gap-3 rounded-2xl bg-white px-5 text-slate-900 transition-opacity hover:opacity-90"
              >
                <PlayGlyph aria-hidden className="size-7 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-light tracking-wide text-slate-500 uppercase">
                    {t("download.googlePlaySmall")}
                  </span>
                  <span className="text-base font-medium">Google Play</span>
                </span>
              </a>
              <a
                href="https://apps.apple.com/uz/app/hayrli-pro/id6778512406"
                target="_blank"
                rel="noreferrer"
                className="flex h-14 w-56 items-center justify-center gap-3 rounded-2xl bg-white px-5 text-slate-900 transition-opacity hover:opacity-90"
              >
                <AppleGlyph aria-hidden className="size-7 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-light tracking-wide text-slate-500 uppercase">
                    {t("download.appStoreSmall")}
                  </span>
                  <span className="text-base font-medium">App Store</span>
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

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
