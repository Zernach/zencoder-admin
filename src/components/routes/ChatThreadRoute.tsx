import { useLocalSearchParams } from "expo-router";
import { ChatThreadScreen } from "@/features/chat/screens";
import { useAppSelector, selectMostRecentTab } from "@/store";

export function ChatThreadRoute() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const tab = useAppSelector(selectMostRecentTab);

  return <ChatThreadScreen tab={tab} chatId={chatId ?? ""} />;
}
