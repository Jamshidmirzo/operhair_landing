import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Hayrli",
};

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("privacy");

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
            {["phone", "name", "city", "photo", "bookings", "reviews", "selfie", "fcm"].map(
              (k) => (
                <li key={k}>{t(`s2.items.${k}`)}</li>
              )
            )}
          </ul>
          <p className="mt-3">{t("s2.note")}</p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s3.heading")}</h2>
          <p className="mb-2">{t("s3.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            {["booking", "push", "reviews", "ai", "safety"].map((k) => (
              <li key={k}>{t(`s3.items.${k}`)}</li>
            ))}
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s4.heading")}</h2>
          <p className="mb-2">{t("s4.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            {["ai1", "ai2", "ai3", "firebase"].map((k) => (
              <li key={k}>{t(`s4.items.${k}`)}</li>
            ))}
          </ul>
          <p className="mt-3">{t("s4.noSale")}</p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s5.heading")}</h2>
          <p>{t("s5.body")}</p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s6.heading")}</h2>
          <p className="mb-2">{t("s6.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            {["access", "delete", "portability", "revoke"].map((k) => (
              <li key={k}>{t(`s6.items.${k}`)}</li>
            ))}
          </ul>
          <p className="mt-3">{t("s6.deleteNote")}</p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s7.heading")}</h2>
          <p>{t("s7.body")}</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>
              <a
                href="mailto:support@hayrli.app"
                className="text-primary underline-offset-2 hover:underline"
              >
                support@hayrli.app
              </a>
            </li>
            <li>
              <a
                href="mailto:legal@hayrli.app"
                className="text-primary underline-offset-2 hover:underline"
              >
                legal@hayrli.app
              </a>
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-medium">{t("s8.heading")}</h2>
          <p>{t("s8.body")}</p>
        </section>
      </div>
    </main>
  );
}
