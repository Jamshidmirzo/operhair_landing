import { useTranslations } from "next-intl";

import { FaqContent } from "./faq-content";
import { Reveal } from "./reveal";

/**
 * FAQ — light-themed section with tab filter (All / Clients / Barbers) and
 * an accordion. Tabs and accordion need to be client-side, so they live in
 * the `FaqContent` island. The header and the section wrapper stay server.
 */
export function Faq() {
  const t = useTranslations("faq");

  // We feed translated strings into the client island so it remains free of
  // direct `next-intl` usage at runtime — keeps the bundle a tad smaller and
  // avoids hydration-mismatch surface area.
  const labels = {
    tabs: {
      all: t("tabs.all"),
      clients: t("tabs.clients"),
      barbers: t("tabs.barbers"),
    },
    clients: Array.from({ length: 5 }, (_, i) => ({
      q: t(`questions.clients.${i}.q`),
      a: t(`questions.clients.${i}.a`),
    })),
    barbers: Array.from({ length: 5 }, (_, i) => ({
      q: t(`questions.barbers.${i}.q`),
      a: t(`questions.barbers.${i}.a`),
    })),
  };

  return (
    <section
      id="faq"
      className="border-t border-border/60 bg-white px-6 py-24 sm:py-32"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Reveal>
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

        <Reveal delay={0.15}>
          <div className="mt-10">
            <FaqContent labels={labels} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
