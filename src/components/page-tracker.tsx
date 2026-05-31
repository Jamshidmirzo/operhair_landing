"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_URL = "https://api.hayrli.app/api/v1/pageviews";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
