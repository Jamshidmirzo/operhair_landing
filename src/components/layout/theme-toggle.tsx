"use client";

import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * Day/night switch. The knob is a sun that turns into a cratered moon as it
 * slides across a sky track (clouds by day, twinkling stars by night).
 *
 * On browsers with the View Transitions API the new theme is revealed as a
 * circle growing out of the switch itself; elsewhere it just swaps.
 */
const noopSubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);

  // Avoid hydration mismatch — false on the server, true once hydrated
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className={cn("h-7 w-[3.25rem]", className)} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  const toggle = () => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!document.startViewTransition || reduce || !ref.current) {
      apply();
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      flushSync(apply);
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`],
        },
        {
          duration: 750,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "relative h-7 w-[3.25rem] shrink-0 overflow-hidden rounded-full ring-1 transition-[background-color,box-shadow] duration-500",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isDark
          ? "bg-[#151a33] shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)] ring-white/10"
          : "bg-[#8ec5f2] shadow-[inset_0_1px_4px_rgba(0,40,90,0.25)] ring-black/5",
        className,
      )}
    >
      {/* Stars (night) */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-all duration-500",
          isDark ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <span className="theme-star absolute top-[6px] left-[9px] size-[2px]" />
        <span className="theme-star absolute top-[15px] left-[16px] size-[1.5px] [animation-delay:.6s]" />
        <span className="theme-star absolute top-[9px] left-[22px] size-[2px] [animation-delay:1.2s]" />
        <span className="theme-star absolute top-[19px] left-[7px] size-[1px] [animation-delay:.3s]" />
      </span>

      {/* Clouds (day) */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-all duration-500",
          isDark ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <span className="absolute top-[13px] right-[5px] h-[7px] w-[16px] rounded-full bg-white/90" />
        <span className="absolute top-[9px] right-[9px] size-[8px] rounded-full bg-white/90" />
        <span className="absolute top-[17px] right-[16px] h-[5px] w-[10px] rounded-full bg-white/70" />
      </span>

      {/* Knob: sun ↔ moon */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[3px] left-[3px] size-[22px] rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(.68,-0.35,.27,1.35)]",
          isDark
            ? "translate-x-6 rotate-[200deg] bg-[#e8e6df] shadow-[0_0_10px_rgba(232,230,223,0.45)]"
            : "translate-x-0 rotate-0 bg-[#ffc94a] shadow-[0_0_12px_rgba(255,190,60,0.9)]",
        )}
      >
        {/* Craters fade in at night */}
        <span
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isDark ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="absolute top-[5px] left-[11px] size-[5px] rounded-full bg-[#c9c6bb]" />
          <span className="absolute top-[12px] left-[5px] size-[4px] rounded-full bg-[#c9c6bb]" />
          <span className="absolute top-[14px] left-[13px] size-[3px] rounded-full bg-[#c9c6bb]" />
        </span>
      </span>
    </button>
  );
}
