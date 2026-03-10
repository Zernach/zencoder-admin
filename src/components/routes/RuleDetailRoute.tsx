import { useLocalSearchParams } from "expo-router";
import { RuleDetailScreen } from "@/features/search/screens";

export function RuleDetailRoute() {
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  return <RuleDetailScreen ruleId={ruleId ?? ""} />;
}
