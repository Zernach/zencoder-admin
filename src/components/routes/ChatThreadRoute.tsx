import { useLocalSearchParams, usePathname } from "expo-router";
import { useMemo } from "react";
import { TABS, isTab, resolveTabFromPathname } from "@/constants/routes";
import { ChatThreadScreen } from "@/features/chat/screens";
import { useAppSelector, selectMostRecentTab } from "@/store";

export function ChatThreadRoute() {
  const { chatId, tab: tabParam } = useLocalSearchParams<{ chatId: string; tab?: string }>();
  const pathname = usePathname();
  const mostRecentTab = useAppSelector(selectMostRecentTab);
  const pathnameTab = resolveTabFromPathname(pathname);
  const tab = useMemo(() => {
    const value = Array.isArray(tabParam) ? tabParam[0] : tabParam;
    if (value != null && isTab(value) && value !== TABS.CHAT) {
      return value;
    }

    if (pathnameTab !== TABS.CHAT) {
      return pathnameTab;
    }

    return mostRecentTab;
  }, [tabParam, pathnameTab, mostRecentTab]);

  return <ChatThreadScreen tab={tab} chatId={chatId ?? ""} />;
}
