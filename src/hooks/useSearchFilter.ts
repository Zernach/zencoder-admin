import { useMemo } from "react";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";

/**
 * Filters an array of objects by the global search query.
 * Matches case-insensitively against the string representation of each specified key.
 * Returns the original array reference when the search query is empty.
 */
export function useSearchFilter<T>(
  data: T[],
  searchableKeys: (keyof T)[],
): T[] {
  const { searchQuery } = useDashboardFilters();

  return useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return data;

    return data.filter((row) =>
      searchableKeys.some((key) => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(trimmed);
      }),
    );
  }, [data, searchQuery, searchableKeys]);
}
