import { usePathname } from "expo-router";
import { resolveTabFromPathname } from "@/constants/routes";
import { CreateChatScreen } from "@/features/chat/screens";

export function CreateChatRoute() {
  const pathname = usePathname();
  const tab = resolveTabFromPathname(pathname);

  return <CreateChatScreen tab={tab} />;
}
