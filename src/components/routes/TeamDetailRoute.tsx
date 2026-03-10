import { useLocalSearchParams } from "expo-router";
import { TeamDetailScreen } from "@/features/search/screens";

export function TeamDetailRoute() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  return <TeamDetailScreen teamId={teamId ?? ""} />;
}
