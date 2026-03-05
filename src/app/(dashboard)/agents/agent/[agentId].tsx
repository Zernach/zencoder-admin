import { useLocalSearchParams } from "expo-router";
import { AgentDetailScreen } from "@/features/search/screens";

export default function AgentDetailRoute() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  return <AgentDetailScreen agentId={agentId ?? ""} originTab="agents" />;
}
