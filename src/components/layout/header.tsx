"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";

const NAV_ITEMS = [
  { key: "forClients", href: "#for-clients" },
  { key: "forBarbers", href: "#for-barbers" },
  { key: "faq", href: "#faq" },
] as const;

export function Header() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        "border-b border-transparent",
        scrolled
          ? "border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "bg-background/0",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
        {/* Left: wordmark */}
        <a href="#top" aria-label="Hayrli" className="shrink-0">
          <Wordmark />
        </a>

        {/* Center: nav (desktop) */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        {/* Right: lang + cta (desktop) / hamburger (mobile) */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              size="sm"
              className="rounded-full px-4"
              render={<a href="#for-clients" />}
            >
              {t("cta.download")}
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("cta.openMenu")}
                  />
                }
              >
                <Menu aria-hidden />
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>
                    <Wordmark />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {t("nav.menu")}
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pb-4">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className="rounded-md px-2 py-3 text-base font-light text-foreground hover:bg-muted"
                    >
                      {t(`nav.${item.key}`)}
                    </a>
                  ))}
                </nav>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-4 py-4">
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full px-4"
                    render={
                      <a
                        href="#for-clients"
                        onClick={() => setSheetOpen(false)}
                      />
                    }
                  >
                    {t("cta.download")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
