import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";

export function useRunsExplorer() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [sortBy, setSortBy] = useState<"startedAtIso" | "costUsd" | "durationMs" | "totalTokens">("startedAtIso");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const query = useQuery({
    queryKey: queryKeys.runsPage(page, pageSize, sortBy, sortDirection),
    queryFn: () =>
      analyticsService.getRunsPage({
        filters,
        page,
        pageSize,
        sortBy,
        sortDirection,
      }),
  });

  const handleSort = (key: string) => {
    if (key === sortBy) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key as typeof sortBy);
      setSortDirection("desc");
    }
    setPage(1);
  };

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
    page,
    pageSize,
    sortBy,
    sortDirection,
    setPage,
    handleSort,
  };
}
