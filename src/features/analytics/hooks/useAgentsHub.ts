import { useDashboardQuery } from "./useDashboardQuery";

export function useAgentsHub() {
  return useDashboardQuery("agentsHub", (s, f) => s.getAgentsHub(f));
}
