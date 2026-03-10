import { useLocalSearchParams } from "expo-router";
import { ProjectDetailScreen } from "@/features/search/screens";

export function ProjectDetailRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <ProjectDetailScreen projectId={projectId ?? ""} />;
}
