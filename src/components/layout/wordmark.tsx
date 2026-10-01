import { cn } from "@/lib/utils";

/**
 * Hayrli brand marks. Both are single-colour PNGs used as CSS masks, so they
 * take `currentColor` and follow the theme without separate light/dark files.
 */

const LOGO_RATIO = 673 / 240; // horizontal lockup, from the brand PDF
const MARK_RATIO = 546 / 512; // shears + comb "H" symbol

function maskStyle(src: string): React.CSSProperties {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

/** Full "Hayrli" horizontal lockup. `height` is in px. */
export function Wordmark({
  className,
  height = 24,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span
      role="img"
      aria-label="Hayrli"
      className={cn("inline-block shrink-0 bg-current text-foreground", className)}
      style={{
        ...maskStyle("/brand/hayrli-logo.png"),
        height,
        width: Math.round(height * LOGO_RATIO),
      }}
    />
  );
}

/** Standalone "H" symbol. `size` is the height in px. */
export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      role="img"
      aria-label="Hayrli"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        ...maskStyle("/brand/hayrli-mark.png"),
        height: size,
        width: Math.round(size * MARK_RATIO),
      }}
    />
  );
}
