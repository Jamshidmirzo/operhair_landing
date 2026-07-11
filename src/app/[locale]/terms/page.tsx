import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Hayrli",
};

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("terms");

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mb-12 text-sm text-muted-foreground">{t("effectiveDate")}</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-foreground/90">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s1.heading")}</h2>
          <p>{t("s1.body")}</p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s2.heading")}</h2>
          <p className="mb-2">{t("s2.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            {["age", "accurate", "noSpam", "noAbuse"].map((k) => (
              <li key={k}>{t(`s2.items.${k}`)}</li>
            ))}
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s3.heading")}</h2>
          <p>{t("s3.body")}</p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s4.heading")}</h2>
          <p className="mb-2">{t("s4.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            {["license", "usercontent", "trademarks"].map((k) => (
              <li key={k}>{t(`s4.items.${k}`)}</li>
            ))}
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s5.heading")}</h2>
          <p>{t("s5.body")}</p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s6.heading")}</h2>
          <p>{t("s6.body")}</p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s7.heading")}</h2>
          <p>{t("s7.body")}</p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s8.heading")}</h2>
          <p>{t("s8.body")}</p>
          <p className="mt-2">
            <a
              href="mailto:legal@hayrli.app"
              className="text-primary underline-offset-2 hover:underline"
            >
              legal@hayrli.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
