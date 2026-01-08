"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useSelectedYear(defaultYear = "2026") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = searchParams.get("year") || defaultYear;

  const setYear = useCallback(
    (newYear: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", newYear);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return { year, setYear, yearNum: parseInt(year, 10) };
}
