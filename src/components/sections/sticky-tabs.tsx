"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type TabId = "for-clients" | "for-barbers";

const TABS: Array<{ id: TabId; key: "iAmClient" | "iAmBarber" }> = [
  { id: "for-clients", key: "iAmClient" },
  { id: "for-barbers", key: "iAmBarber" },
];

export function StickyTabs() {
  const t = useTranslations("tabs");
  const [active, setActive] = useState<TabId | null>(null);
  const [hidden, setHidden] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Track which target section is currently in viewport.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targets = TABS.map((tab) => document.getElementById(tab.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is most centered.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.intersectionRect.top) -
              Math.abs(b.intersectionRect.top),
          );
        const first = visible[0];
        if (first) {
          setActive(first.target.id as TabId);
        }
      },
      {
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0, 0.25, 0.5],
      },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hide the bar once the user scrolls past the footer.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setHidden(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const onClick = (id: TabId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Sentinel: when this scrolls past the top of the viewport, the bar
          “engages” its sticky position. */}
      <div ref={sentinelRef} aria-hidden className="h-0" />

      <div
        aria-hidden={hidden}
        className={cn(
          "sticky top-14 z-30 flex w-full justify-center transition-all duration-200",
          hidden && "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div
          role="tablist"
          aria-label="Audience"
          className="mt-4 flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
        >
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onClick(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-light transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(tab.key)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
