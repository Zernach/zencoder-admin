import { useDashboardQuery } from "./useDashboardQuery";

export function useCostDashboard() {
  return useDashboardQuery("cost", (s, f) => s.getCost(f));
}
