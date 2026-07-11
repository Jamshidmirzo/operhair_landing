import { Camera, MessageCircle, Play } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "./language-switcher";
import { Wordmark } from "./wordmark";

const COLUMNS = [
  {
    titleKey: "product",
    links: [
      { key: "hayrli", href: "#for-clients" },
      { key: "hayrliPro", href: "#for-barbers" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { key: "about", href: "#" },
      { key: "contacts", href: "#" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "terms", href: "/terms" },
    ],
  },
] as const;

const SOCIALS = [
  { key: "instagram", href: "#", Icon: Camera },
  { key: "telegram", href: "#", Icon: MessageCircle },
  { key: "youtube", href: "#", Icon: Play },
] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-16 border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <Wordmark className="text-xl" />
            <p className="max-w-xs text-sm font-light text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.titleKey} className="flex flex-col gap-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(`footer.columns.${col.titleKey}`)}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      className="text-sm font-light text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {t(`footer.links.${link.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-border/60 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs font-light text-muted-foreground">
            {t("footer.copyright")}
          </p>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ key, href, Icon }) => (
              <a
                key={key}
                href={href}
                aria-label={t(`footer.social.${key}`)}
                className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                <Icon className="size-3.5" aria-hidden />
              </a>
            ))}
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
