import { setRequestLocale } from "next-intl/server";

import { Faq } from "@/components/sections/faq";
import { ForBarbers } from "@/components/sections/for-barbers";
import { ForClients } from "@/components/sections/for-clients";
import { Hero } from "@/components/sections/hero";
import { StickyTabs } from "@/components/sections/sticky-tabs";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <StickyTabs />
      <ForClients />
      <ForBarbers />
      <Faq />
    </>
  );
}
