import { useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { useAppSelector, selectMostRecentTab } from "@/store";
import { buildEntityRoute } from "@/constants/routes";
import type { SearchEntityType } from "@/features/analytics/types";

/**
 * Stable navigation callback that resolves the current tab from Redux
 * instead of usePathname(), avoiding re-renders on every pathname change.
 * Uses a ref for the tab value so the returned function identity is stable.
 */
export function useNavigateTo(): (entityType: SearchEntityType, entityId: string) => void {
  const router = useRouter();
  const mostRecentTab = useAppSelector(selectMostRecentTab);
  const tabRef = useRef(mostRecentTab);
  tabRef.current = mostRecentTab;

  return useCallback(
    (entityType: SearchEntityType, entityId: string) => {
      const route = buildEntityRoute(tabRef.current, entityType, entityId);
      router.push(route as never);
    },
    [router],
  );
}
