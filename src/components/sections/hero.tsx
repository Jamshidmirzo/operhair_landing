import Image from "next/image";
import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/layout/wordmark";
import { StoreBadge } from "@/components/store-badge";
import { Button } from "@/components/ui/button";

import { CLIENT_SCREENS, STORE_LINKS } from "./app-screens";
import { HeroFade } from "./hero-animations";

// Barber profile · Home · Quick booking — the core client flow at a glance.
const HERO_SCREENS = [CLIENT_SCREENS[1], CLIENT_SCREENS[0], CLIENT_SCREENS[2]];

/**
 * Hero is a server component. The fade-in animations are isolated in a tiny
 * client island (`HeroFade`) so the heavy text content stays server-rendered.
 */
export function Hero() {
  const t = useTranslations();
  const tc = useTranslations("forClients.cta");

  return (
    <section
      id="top"
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-16"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <HeroFade>
          <BrandMark size={44} className="mb-8 text-foreground" />
        </HeroFade>

        <HeroFade delay={0.05}>
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
          <div className="mt-5 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <StoreBadge
              store="apple"
              href={STORE_LINKS.hayrli.apple}
              small={tc("appStoreSmall")}
              big={tc("appStoreBig")}
              ariaLabel={t("hero.appStore")}
            />
            <StoreBadge
              store="google"
              href={STORE_LINKS.hayrli.google}
              small={tc("googlePlaySmall")}
              big={tc("googlePlayBig")}
              ariaLabel={t("hero.googlePlay")}
            />
          </div>
        </HeroFade>

        <HeroFade delay={0.35} className="mt-16 w-full">
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-4 sm:gap-8">
            {HERO_SCREENS.map((screen, i) => {
              const center = i === 1;
              return (
                <div
                  key={screen.src}
                  className={center ? "hero-float" : "hero-float hidden sm:block"}
                  style={{ animationDelay: `${i * -2.3}s` }}
                >
                  <div
                    className={
                      center
                        ? "relative aspect-[9/19.5] w-[220px] overflow-hidden rounded-[2.6rem] bg-[#1b1a1f] p-[6px] shadow-[0_50px_120px_-40px_rgba(27,26,31,0.55)] ring-1 ring-black/10 sm:w-[250px] dark:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] dark:ring-white/15"
                        : "relative aspect-[9/19.5] w-[180px] overflow-hidden rounded-[2.2rem] bg-[#1b1a1f] p-[5px] opacity-90 shadow-[0_30px_80px_-20px_rgba(27,26,31,0.4)] ring-1 ring-black/10 dark:ring-white/10"
                    }
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-black">
                      <Image
                        src={screen.src}
                        alt={t("hero.visualAlt")}
                        fill
                        className="object-cover object-top"
                        sizes={center ? "250px" : "180px"}
                        priority
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </HeroFade>
      </div>
    </section>
  );
}
