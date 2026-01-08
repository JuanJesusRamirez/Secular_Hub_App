"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useCompareYears() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year1 = searchParams.get("year1") || "2025";
  const year2 = searchParams.get("year2") || "2026";

  const setYears = useCallback(
    (newYear1: string, newYear2: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year1", newYear1);
      params.set("year2", newYear2);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return {
    year1,
    year2,
    setYears,
  };
}
