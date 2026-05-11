import { useLocalSearchParams } from "expo-router";
import { GoldenQuestionDetailScreen } from "@/features/search/screens";

export function GoldenQuestionDetailRoute() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  return <GoldenQuestionDetailScreen questionId={questionId ?? ""} />;
}
