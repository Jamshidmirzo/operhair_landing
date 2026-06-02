import Image from "next/image";

import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-hayrli.jpg"
        alt="Hayrli"
        width={28}
        height={28}
        className="rounded-md"
      />
      <span className="font-sans text-lg font-light tracking-tight text-foreground lowercase">
        hayrli
      </span>
    </span>
  );
}
