import { useLocalSearchParams } from "expo-router";
import { AgentDetailScreen } from "@/features/search/screens";

export function AgentDetailRoute() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  return <AgentDetailScreen agentId={agentId ?? ""} />;
}
