import { useLocalSearchParams, usePathname } from "expo-router";
import { resolveTabFromPathname } from "@/constants/routes";
import { ChatThreadScreen } from "@/features/chat/screens";

export function ChatThreadRoute() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const pathname = usePathname();
  const tab = resolveTabFromPathname(pathname);

  return <ChatThreadScreen tab={tab} chatId={chatId ?? ""} />;
}
