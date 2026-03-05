import { useLocalSearchParams } from "expo-router";
import { RunDetailScreen } from "@/features/search/screens";

export default function RunDetailRoute() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  return <RunDetailScreen runId={runId ?? ""} originTab="agents" />;
}
