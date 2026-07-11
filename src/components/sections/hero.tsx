import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { HeroFade } from "./hero-animations";

/**
 * Hero is a server component. The fade-in animations are isolated in a tiny
 * client island (`HeroFade`) so the heavy text content stays server-rendered.
 */
export function Hero() {
  const t = useTranslations();

  return (
    <section
      id="top"
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-16"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <HeroFade>
          <h1
            className="font-sans font-light tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)", lineHeight: 1.02 }}
          >
            <span className="block">{t("hero.headlineLine1")}</span>
            <span className="block text-muted-foreground">
              {t("hero.headlineLine2")}
            </span>
          </h1>
        </HeroFade>

        <HeroFade delay={0.1}>
          <p className="mt-8 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            {t("hero.sub")}
          </p>
        </HeroFade>

        <HeroFade delay={0.2}>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              className="h-11 w-full rounded-full px-6 sm:w-auto"
              render={<a href="#for-clients" />}
            >
              {t("cta.downloadHayrli")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full rounded-full px-6 sm:w-auto"
              render={<a href="#for-barbers" />}
            >
              {t("cta.becomePartner")}
            </Button>
          </div>
          <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row">
            {/* TODO: заменить href="#" на реальный URL после регистрации в App Store Connect */}
            <a
              href="#"
              aria-label={t("hero.appStore")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              {t("hero.appStore")}
            </a>
            {/* TODO: заменить href="#" на реальный URL после регистрации в Google Play Console */}
            <a
              href="#"
              aria-label={t("hero.googlePlay")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M3.18 23.76c.35.2.74.24 1.12.1l12.76-7.37-2.78-2.79-11.1 10.06zM.5 1.5C.19 1.86 0 2.4 0 3.09v17.82c0 .69.19 1.23.5 1.59l.08.08 9.98-9.98v-.23L.58 1.42.5 1.5zM20.13 10.4l-2.7-1.56-3.08 3.08 3.08 3.08 2.72-1.57c.78-.45.78-1.58-.02-2.03zM4.3.14L17.06 7.5l-2.78 2.79L3.17.23c.38-.15.79-.11 1.13.1-.01.01 0 .01 0 .01z" />
              </svg>
              {t("hero.googlePlay")}
            </a>
          </div>
        </HeroFade>

        <HeroFade delay={0.35} className="mt-16 w-full">
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-4 sm:gap-8">
            <div className="relative hidden aspect-[9/19] w-[180px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.3)] ring-1 ring-border/60 sm:block">
              <Image
                src="/screenshots/client-barber.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover"
                sizes="180px"
                priority
              />
            </div>
            <div className="relative aspect-[9/19] w-[220px] overflow-hidden rounded-[2.5rem] shadow-[0_50px_120px_-40px_rgba(15,23,42,0.4)] ring-1 ring-border/60 sm:w-[240px]">
              <Image
                src="/screenshots/client-home.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover"
                sizes="240px"
                priority
              />
            </div>
            <div className="relative hidden aspect-[9/19] w-[180px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.3)] ring-1 ring-border/60 sm:block">
              <Image
                src="/screenshots/client-confirm.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover"
                sizes="180px"
                priority
              />
            </div>
          </div>
        </HeroFade>
      </div>
    </section>
  );
}
