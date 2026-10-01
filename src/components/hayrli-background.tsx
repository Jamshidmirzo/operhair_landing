"use client";

import { useEffect, useRef } from "react";

/**
 * "Combed hair" backdrop for the whole landing.
 *
 * - Soft colour fields whose palette is driven by scroll position: warm
 *   terracotta at the hero → teal for clients → violet dusk for barbers →
 *   sand at the end. Light and dark themes have their own palettes and the
 *   switch between them is eased, so it blends with the toggle's reveal.
 * - A field of flowing strands. The pointer parts them like a comb running
 *   through hair, and fast scrolling makes them ripple harder.
 *
 * Rendered on one fixed <canvas>; paused while the tab is hidden and drawn
 * statically for users who prefer reduced motion.
 */

type RGB = [number, number, number];
type Stop = { base: RGB; a: RGB; b: RGB; strand: RGB; accent: RGB };

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// Palettes sampled at scroll progress 0, ⅓, ⅔, 1.
const LIGHT: Stop[] = [
  { base: hex("#fffdfa"), a: hex("#f6d3c2"), b: hex("#fbe8d6"), strand: hex("#1b1a1f"), accent: hex("#b0563c") },
  { base: hex("#f7fbfb"), a: hex("#cfe9e4"), b: hex("#dbe8f6"), strand: hex("#1d3b3f"), accent: hex("#2f8f83") },
  { base: hex("#f8f6fc"), a: hex("#ddd3f3"), b: hex("#f3d9e6"), strand: hex("#2a2340"), accent: hex("#6d4fc2") },
  { base: hex("#f7f4ef"), a: hex("#ecdcc4"), b: hex("#f2e4dc"), strand: hex("#1b1a1f"), accent: hex("#b0563c") },
];
const DARK: Stop[] = [
  { base: hex("#0b0a0d"), a: hex("#5a2416"), b: hex("#2a1410"), strand: hex("#fffdfa"), accent: hex("#e07a5a") },
  { base: hex("#070c0d"), a: hex("#0f4a48"), b: hex("#102a40"), strand: hex("#e6fffb"), accent: hex("#4fd1c0") },
  { base: hex("#09080f"), a: hex("#3a2a80"), b: hex("#4a1640"), strand: hex("#f1ecff"), accent: hex("#9b7bff") },
  { base: hex("#0b0a0d"), a: hex("#4a2a14"), b: hex("#2a1418"), strand: hex("#fffdfa"), accent: hex("#e07a5a") },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (x: RGB, y: RGB, t: number): RGB => [
  lerp(x[0], y[0], t),
  lerp(x[1], y[1], t),
  lerp(x[2], y[2], t),
];
const rgba = (c: RGB, a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function sample(stops: Stop[], p: number): Stop {
  const f = Math.min(Math.max(p, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(f), stops.length - 2);
  const t = f - i;
  const s = t * t * (3 - 2 * t); // smoothstep between stops
  const A = stops[i]!;
  const B = stops[i + 1]!;
  return {
    base: mix(A.base, B.base, s),
    a: mix(A.a, B.a, s),
    b: mix(A.b, B.b, s),
    strand: mix(A.strand, B.strand, s),
    accent: mix(A.accent, B.accent, s),
  };
}

function blend(x: Stop, y: Stop, t: number): Stop {
  return {
    base: mix(x.base, y.base, t),
    a: mix(x.a, y.a, t),
    b: mix(x.b, y.b, t),
    strand: mix(x.strand, y.strand, t),
    accent: mix(x.accent, y.accent, t),
  };
}

type Strand = {
  y: number; // 0..1 of viewport height
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  width: number;
  alpha: number;
  depth: number; // parallax factor
};

export function HayrliBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let strands: Strand[] = [];

    const build = () => {
      const count = w < 640 ? 18 : 30;
      strands = Array.from({ length: count }, (_, i) => {
        const r = Math.sin(i * 12.9898) * 43758.5453;
        const rand = r - Math.floor(r);
        return {
          y: (i + 0.5) / count + (rand - 0.5) * 0.04,
          amp: 18 + rand * 46,
          freq: 0.0016 + rand * 0.0022,
          speed: 0.15 + rand * 0.35,
          phase: rand * Math.PI * 2,
          width: 0.6 + rand * 1.1,
          alpha: 0.05 + rand * 0.11,
          depth: 0.08 + rand * 0.22,
        };
      });
    };

    const resize = () => {
      // 1× is plenty for soft glows and thin strands, and keeps GPU cost low.
      dpr = 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    // Pointer, eased so the parting follows smoothly.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, power: 0, target: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      pointer.target = 1;
      if (pointer.x < -999) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    };
    const onLeave = () => (pointer.target = 0);

    // Scroll progress + velocity
    let progress = 0;
    let smoothProgress = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? window.scrollY / max : 0;
    };

    let darkMix = document.documentElement.classList.contains("dark") ? 1 : 0;
    let raf = 0;
    let t = 0;
    let last = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      // ~30fps is smooth enough for a slow backdrop and halves the work
      if (now - last < 32) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) t += dt;

      // Ease everything
      const isDark = document.documentElement.classList.contains("dark");
      darkMix = lerp(darkMix, isDark ? 1 : 0, reduce ? 1 : 0.12);
      smoothProgress = lerp(smoothProgress, progress, reduce ? 1 : 0.08);
      const sy = window.scrollY;
      velocity = lerp(velocity, Math.abs(sy - lastY), 0.15);
      lastY = sy;
      pointer.x = lerp(pointer.x, pointer.tx, 0.12);
      pointer.y = lerp(pointer.y, pointer.ty, 0.12);
      pointer.power = lerp(pointer.power, pointer.target, 0.06);

      const pal = blend(
        sample(LIGHT, smoothProgress),
        sample(DARK, smoothProgress),
        darkMix,
      );

      // 1) Base
      ctx.fillStyle = rgba(pal.base, 1);
      ctx.fillRect(0, 0, w, h);

      // 2) Colour fields — two big drifting glows, nudged toward the pointer
      const glowA = darkMix > 0.5 ? 0.55 : 0.75;
      const px = pointer.power > 0.01 ? (pointer.x / w - 0.5) * 60 * pointer.power : 0;
      const py = pointer.power > 0.01 ? (pointer.y / h - 0.5) * 60 * pointer.power : 0;
      const fields: Array<[number, number, number, RGB]> = [
        [w * (0.22 + 0.06 * Math.sin(t * 0.13)) + px, h * (0.28 + 0.05 * Math.cos(t * 0.11)) + py, Math.max(w, h) * 0.6, pal.a],
        [w * (0.82 + 0.05 * Math.cos(t * 0.09)) - px, h * (0.72 + 0.06 * Math.sin(t * 0.12)) - py, Math.max(w, h) * 0.55, pal.b],
      ];
      for (const [x, y, r, c] of fields) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(c, glowA));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // 3) Strands
      const step = w < 640 ? 18 : 14;
      const radius = coarse ? 0 : 150;
      const ripple = 1 + Math.min(velocity / 18, 2.2);
      const strandBoost = darkMix > 0.5 ? 1.35 : 1;

      for (const s of strands) {
        // Parallax: strands drift up as the page scrolls, wrapping around.
        let base = (s.y * h - sy * s.depth) % (h + 120);
        if (base < -60) base += h + 120;

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, rgba(pal.strand, 0));
        grad.addColorStop(0.25, rgba(pal.strand, s.alpha * strandBoost));
        grad.addColorStop(0.6, rgba(pal.accent, s.alpha * 1.8 * strandBoost));
        grad.addColorStop(1, rgba(pal.strand, 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();

        for (let x = -step; x <= w + step; x += step) {
          let y =
            base +
            Math.sin(x * s.freq + t * s.speed * ripple + s.phase) * s.amp +
            Math.sin(x * s.freq * 2.3 - t * s.speed * 0.7) * s.amp * 0.25;

          // Comb: push strands away from the pointer vertically
          if (radius > 0 && pointer.power > 0.01) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < radius) {
              const f = 1 - d / radius;
              y += Math.sign(dy || 1) * f * f * 70 * pointer.power;
            }
          }

          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4) Comb glow under the pointer
      if (radius > 0 && pointer.power > 0.01) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        g.addColorStop(0, rgba(pal.accent, 0.12 * pointer.power));
        g.addColorStop(1, rgba(pal.accent, 0));
        ctx.fillStyle = g;
        ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
      }

    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    readScroll();
    smoothProgress = progress;
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen"
    />
  );
}
