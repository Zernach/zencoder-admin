import { useDashboardQuery } from "./useDashboardQuery";

export function useLiveAgentSessions() {
  const { data, loading, error, refetch } = useDashboardQuery(
    "liveAgentSessions",
    (s, f) => s.getLiveAgentSessions(f),
    { refetchInterval: 4_000, refetchIntervalInBackground: true, staleTime: 1_000 },
  );

  return {
    data: data?.activeSessions ?? [],
    lastUpdatedIso: data?.lastUpdatedIso,
    loading,
    error,
    refetch,
  };
}
