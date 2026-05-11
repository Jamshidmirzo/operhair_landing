import { cn } from "@/lib/utils";

/**
 * Lowercase wordmark for "hayrli". Tracking-tight, font-light keeps the Apple
 * feel. Pass `className` to override size at call sites.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-sans text-lg font-light tracking-tight text-foreground lowercase",
        className,
      )}
    >
      hayrli
    </span>
  );
}
