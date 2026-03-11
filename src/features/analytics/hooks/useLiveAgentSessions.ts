import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useAppDependencies } from "@/core/di";
import type { LiveAgentSession, LiveAgentSessionsSocket, LiveAgentSessionsSocketMessage } from "@/features/analytics/types";
import { useActiveDashboardFilters } from "./useDashboardFilters";

/** Stable empty array so callers don't get a new reference every render. */
const EMPTY_SESSIONS: LiveAgentSession[] = [];

export function useLiveAgentSessions() {
  const filters = useActiveDashboardFilters();
  const { analyticsService } = useAppDependencies();
  const [data, setData] = useState<LiveAgentSessionsSocketMessage["data"]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [reconnectToken, setReconnectToken] = useState(0);
  const socketRef = useRef<LiveAgentSessionsSocket | null>(null);

  useEffect(() => {
    let disposed = false;

    setLoading(true);
    setError(undefined);

    const socket = analyticsService.connectLiveAgentSessionsSocket(filters);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (disposed) return;
      try {
        const parsed = JSON.parse(event.data) as LiveAgentSessionsSocketMessage;
        if (parsed.channel !== "analytics.liveAgentSessions" || parsed.type !== "snapshot") {
          return;
        }
        setData(parsed.data);
        setLoading(false);
      } catch {
        setError("Live session stream returned an invalid payload.");
        setLoading(false);
      }
    };

    socket.onerror = (event) => {
      if (disposed) return;
      setError(event.message || "Live session stream failed.");
      setLoading(false);
    };

    socket.onclose = (event) => {
      if (disposed || event.code === 1000) return;
      setError(event.reason || "Live session stream closed unexpectedly.");
      setLoading(false);
    };

    return () => {
      disposed = true;
      if (socketRef.current && socketRef.current.readyState !== 3) {
        socketRef.current.close(1000, "hook cleanup");
      }
      socketRef.current = null;
    };
  }, [analyticsService, filters, reconnectToken]);

  const refetch = useCallback(() => {
    setReconnectToken((value) => value + 1);
  }, []);

  const activeSessions = data?.activeSessions ?? EMPTY_SESSIONS;
  const lastUpdatedIso = data?.lastUpdatedIso;
  const errorMessage = error ? getApiErrorMessage(error) : undefined;

  return useMemo(() => ({
    data: activeSessions,
    lastUpdatedIso,
    loading,
    error: errorMessage,
    refetch,
  }), [activeSessions, lastUpdatedIso, loading, errorMessage, refetch]);
}
