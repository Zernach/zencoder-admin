import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { selectSearchQuery } from "@/store/slices/filtersSlice";

/**
 * Filters an array of objects by the global search query.
 * Matches case-insensitively against the string representation of each specified key.
 * Returns the original array reference when the search query is empty.
 *
 * Subscribes ONLY to searchQuery (not full filter state) to avoid
 * unnecessary re-renders when team/project/provider/status filters change.
 */
export function useSearchFilter<T>(
  data: T[],
  searchableKeys: (keyof T)[],
): T[] {
  const searchQuery = useAppSelector(selectSearchQuery);

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
