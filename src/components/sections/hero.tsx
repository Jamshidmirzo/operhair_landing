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
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-800 uppercase">
                {t("tabs.comingSoon")}
              </span>
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
        </HeroFade>

        <HeroFade delay={0.35} className="mt-16 w-full">
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-4 sm:gap-8">
            <div className="relative hidden aspect-[9/19] w-[180px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.3)] ring-1 ring-border/60 sm:block">
              <Image
                src="/screenshots/client-barber.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover blur-[6px]"
                sizes="180px"
                priority
              />
            </div>
            <div className="relative aspect-[9/19] w-[220px] overflow-hidden rounded-[2.5rem] shadow-[0_50px_120px_-40px_rgba(15,23,42,0.4)] ring-1 ring-border/60 sm:w-[240px]">
              <Image
                src="/screenshots/client-home.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover blur-[6px]"
                sizes="240px"
                priority
              />
            </div>
            <div className="relative hidden aspect-[9/19] w-[180px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.3)] ring-1 ring-border/60 sm:block">
              <Image
                src="/screenshots/client-confirm.png"
                alt={t("hero.visualAlt")}
                fill
                className="object-cover blur-[6px]"
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
