import { useLocalSearchParams } from "expo-router";
import { HumanDetailScreen } from "@/features/search/screens";

export default function HumanDetailRoute() {
  const { humanId } = useLocalSearchParams<{ humanId: string }>();
  return <HumanDetailScreen humanId={humanId ?? ""} originTab="dashboard" />;
}
