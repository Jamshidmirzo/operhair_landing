"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

export type Screen = { src: string; label: string };

const AUTOPLAY_MS = 4200;

/**
 * Interactive phone showcase. One device in focus with its neighbours fanned
 * out behind it; a numbered list (desktop) / chip row (mobile) to jump around,
 * swipe on touch, gentle 3D tilt under the cursor, and autoplay while the
 * section is in view and not hovered.
 */
export function ScreenShowcase({
  screens,
  tone = "auto",
  ratio = 9 / 19.5,
  className,
}: {
  screens: Screen[];
  /** Screenshot width / height, so the device frame never crops the UI. */
  ratio?: number;
  /** "dark" for sections that are always dark (Hayrli Pro). */
  tone?: "auto" | "dark";
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.4 });
  const reduce = useReducedMotion();
  const n = screens.length;

  const go = useCallback(
    (to: number) => {
      const next = ((to % n) + n) % n;
      setDir(next > index || (index === n - 1 && next === 0) ? 1 : -1);
      setIndex(next);
    },
    [index, n],
  );

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [inView, paused, reduce, index, go]);

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });
  const glareX = useTransform(ry, [-12, 12], [-30, 30]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setPaused(false);
  };

  const dark = tone === "dark";
  const prev = screens[(index - 1 + n) % n]!;
  const next = screens[(index + 1) % n]!;
  const current = screens[index]!;

  return (
    <div
      ref={rootRef}
      className={cn(
        "grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16",
        className,
      )}
    >
      {/* Index — desktop list */}
      <ol className="order-2 hidden flex-col gap-1 lg:order-1 lg:flex">
        {screens.map((s, i) => {
          const active = i === index;
          return (
            <li key={s.src}>
              <button
                type="button"
                onClick={() => go(i)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                aria-current={active}
                className={cn(
                  "group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl px-5 py-4 text-left transition-colors",
                  active
                    ? dark
                      ? "bg-white/10"
                      : "bg-foreground/[0.06]"
                    : dark
                      ? "hover:bg-white/5"
                      : "hover:bg-foreground/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums transition-colors",
                    active
                      ? dark
                        ? "text-white"
                        : "text-foreground"
                      : dark
                        ? "text-slate-500"
                        : "text-muted-foreground/60",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-lg font-light tracking-tight transition-all duration-300",
                    active
                      ? dark
                        ? "translate-x-1 text-white"
                        : "translate-x-1 text-foreground"
                      : dark
                        ? "text-slate-400 group-hover:text-slate-200"
                        : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {s.label}
                </span>
                {/* Autoplay progress */}
                {active && (
                  <span
                    key={`${index}-${paused}-${inView}`}
                    aria-hidden
                    className={cn(
                      "absolute bottom-0 left-0 h-[2px]",
                      dark ? "bg-white/60" : "bg-foreground/50",
                      inView && !paused && !reduce ? "showcase-progress" : "w-0",
                    )}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Device stage */}
      <div
        className="order-1 flex flex-col items-center lg:order-2"
        onPointerMove={onMove}
        onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
        onPointerLeave={onLeave}
        style={{ perspective: 1400 }}
      >
        <div className="relative h-[540px] w-full max-w-[460px] sm:h-[600px]">
          {/* Neighbours fanned behind */}
          {n > 1 && (
            <>
              <Phone
                key={`prev-${prev.src}`}
                src={prev.src}
                alt=""
                dark={dark}
                ratio={ratio}
                className="absolute top-1/2 left-1/2 hidden w-[200px] -translate-x-[115%] -translate-y-[46%] -rotate-[8deg] opacity-50 blur-[1px] transition-all duration-700 sm:block"
                onClick={() => go(index - 1)}
              />
              <Phone
                key={`next-${next.src}`}
                src={next.src}
                alt=""
                dark={dark}
                ratio={ratio}
                className="absolute top-1/2 left-1/2 hidden w-[200px] translate-x-[15%] -translate-y-[46%] rotate-[8deg] opacity-50 blur-[1px] transition-all duration-700 sm:block"
                onClick={() => go(index + 1)}
              />
            </>
          )}

          {/* Focus device */}
          <motion.div
            className="absolute top-1/2 left-1/2 z-10 w-[250px] -translate-x-1/2 -translate-y-1/2 sm:w-[270px]"
            style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(index + 1);
              else if (info.offset.x > 50) go(index - 1);
            }}
          >
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-[2.75rem] p-[7px]",
                dark
                  ? "bg-[#1c1b21] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/15"
                  : "bg-[#1b1a1f] shadow-[0_60px_120px_-40px_rgba(27,26,31,0.55)] ring-1 ring-black/10 dark:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)] dark:ring-white/15",
              )}
              style={{ aspectRatio: ratio }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-black">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={current.src}
                    custom={dir}
                    className="absolute inset-0"
                    initial={reduce ? { opacity: 0 } : { x: `${dir * 100}%`, opacity: 0.6, scale: 0.96 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { x: `${dir * -35}%`, opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={current.src}
                      alt={current.label}
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover object-top select-none"
                      sizes="280px"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Glass glare that moves with tilt */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent mix-blend-overlay"
                  style={reduce ? undefined : { x: glareX }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Caption + mobile chips */}
        <AnimatePresence mode="wait">
          <motion.p
            key={current.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mt-2 text-sm font-light lg:hidden",
              dark ? "text-slate-300" : "text-muted-foreground",
            )}
          >
            {current.label}
          </motion.p>
        </AnimatePresence>

        <div className="mt-5 flex items-center gap-2" role="tablist">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.label}
              onClick={() => go(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-8" : "w-1.5",
                dark
                  ? i === index
                    ? "bg-white"
                    : "bg-white/25 hover:bg-white/50"
                  : i === index
                    ? "bg-foreground"
                    : "bg-foreground/20 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Phone({
  src,
  alt,
  dark,
  ratio,
  className,
  onClick,
}: {
  src: string;
  alt: string;
  dark: boolean;
  ratio: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={onClick}
      className={cn("cursor-pointer hover:opacity-80", className)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[2.25rem] p-[5px]",
          dark ? "bg-[#1c1b21] ring-1 ring-white/10" : "bg-[#1b1a1f] ring-1 ring-black/10 dark:ring-white/10",
        )}
        style={{ aspectRatio: ratio }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-black">
          <Image src={src} alt={alt} fill className="object-cover object-top" sizes="200px" />
        </div>
      </div>
    </button>
  );
}
