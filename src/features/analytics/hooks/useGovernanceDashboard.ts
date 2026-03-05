import { useDashboardQuery } from "./useDashboardQuery";

export function useGovernanceDashboard() {
  return useDashboardQuery("governance", (s, f) => s.getGovernance(f));
}
