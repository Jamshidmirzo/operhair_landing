"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Mounts Lenis for smooth scrolling on non-touch devices. On touch devices we
 * keep the native scroll because Lenis hijacks momentum on iOS/Android in a
 * way that feels worse than the OS default.
 *
 * Renders nothing — this is purely an effect.
 */
export function LenisProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouch =
      window.matchMedia?.("(pointer: coarse)").matches ||
      "ontouchstart" in window;
    if (isTouch) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Apple-ish ease-out cubic
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
