"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, Check } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
};

/**
 * Locale picker. Uses next-intl's `useRouter` so the segment swap preserves
 * the current pathname; the middleware persists `NEXT_LOCALE` cookie.
 */
export function LanguageSwitcher({ className }: Props) {
  const t = useTranslations("language");
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    if (next === active) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 font-light uppercase tracking-wide",
              isPending && "opacity-60",
              className,
            )}
            aria-label={t("label")}
          />
        }
      >
        {active}
        <ChevronDown className="size-3" aria-hidden />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={8} align="end">
          <MenuPrimitive.Popup
            className={cn(
              "z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none",
              "transition-all duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          >
            {locales.map((loc) => (
              <MenuPrimitive.Item
                key={loc}
                onClick={() => onSelect(loc)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-light outline-none",
                  "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                )}
              >
                <span>{t(loc)}</span>
                {loc === active ? (
                  <Check className="size-3.5 text-muted-foreground" aria-hidden />
                ) : null}
              </MenuPrimitive.Item>
            ))}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
