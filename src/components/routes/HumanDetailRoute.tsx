import { useLocalSearchParams } from "expo-router";
import { HumanDetailScreen } from "@/features/search/screens";

export function HumanDetailRoute() {
  const { humanId } = useLocalSearchParams<{ humanId: string }>();
  return <HumanDetailScreen humanId={humanId ?? ""} />;
}
