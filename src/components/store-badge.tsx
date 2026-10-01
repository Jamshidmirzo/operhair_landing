import { cn } from "@/lib/utils";

/**
 * App Store / Google Play badges drawn after the official artwork: Apple logo
 * + "Download on the / App Store", and the four-colour Play triangle +
 * "Get it on / Google Play".
 *
 * tone="auto"  → black badge in light mode, white badge in dark mode
 * tone="light" → always white (for permanently dark sections)
 * tone="dark"  → always black
 */
type Tone = "auto" | "light" | "dark";

const TONES: Record<Tone, string> = {
  auto: "bg-black text-white ring-black/10 dark:bg-white dark:text-black dark:ring-white/20",
  light: "bg-white text-black ring-white/20",
  dark: "bg-black text-white ring-white/15",
};

export function StoreBadge({
  store,
  href,
  small,
  big,
  ariaLabel,
  tone = "auto",
  className,
}: {
  store: "apple" | "google";
  href: string;
  small: string;
  big: string;
  ariaLabel?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? `${small} ${big}`}
      className={cn(
        "group relative inline-flex h-14 min-w-[11.5rem] items-center gap-3 overflow-hidden rounded-[14px] px-4 ring-1 transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)] active:translate-y-0",
        TONES[tone],
        className,
      )}
    >
      {/* Sheen that sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-15"
      />
      {store === "apple" ? (
        <AppleLogo className="size-7 shrink-0" />
      ) : (
        <GooglePlayLogo className="size-7 shrink-0" />
      )}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-medium tracking-wide opacity-90">
          {small}
        </span>
        <span className="mt-1 text-[21px] font-semibold tracking-[-0.02em]">
          {big}
        </span>
      </span>
    </a>
  );
}

function AppleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 30" aria-hidden {...props}>
      <path
        fill="#00D7FE"
        d="M1.03.47C.71.81.52 1.34.52 2.03v25.94c0 .69.19 1.22.51 1.56l.08.08L15.65 15.07v-.34L1.11.39l-.08.08z"
      />
      <path
        fill="#FFCE00"
        d="m20.49 19.92-4.84-4.85v-.34l4.84-4.84.11.06 5.74 3.26c1.64.93 1.64 2.46 0 3.4l-5.74 3.26-.11.05z"
      />
      <path
        fill="#FF3A44"
        d="M20.6 19.86 15.65 14.9 1.03 29.53c.54.57 1.43.64 2.44.07L20.6 19.86"
      />
      <path
        fill="#00F076"
        d="M20.6 9.95 3.47.21C2.46-.36 1.57-.29 1.03.28L15.65 14.9l4.95-4.95z"
      />
    </svg>
  );
}
