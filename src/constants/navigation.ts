import {
  Home,
  Bot,
  DollarSign,
  Shield,
  Settings,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ROUTES, TABS, TAB_ORDER, getRouteForTab, type TabRoute } from "./routes";

// ─── Top-Level Navigation ───────────────────────────────

export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: TabRoute;
  tab: TABS;
}

const TOP_NAV_METADATA: Record<TABS, Pick<NavItem, "icon" | "label">> = {
  [TABS.DASHBOARD]: { icon: Home, label: "Home" },
  [TABS.AGENTS]: { icon: Bot, label: "Agents" },
  [TABS.COSTS]: { icon: DollarSign, label: "Costs" },
  [TABS.GOVERNANCE]: { icon: Shield, label: "Governance" },
  [TABS.SETTINGS]: { icon: Settings, label: "Settings" },
};

export const TOP_NAV_ITEMS: NavItem[] = TAB_ORDER.map((tab) => ({
  tab,
  route: getRouteForTab(tab),
  ...TOP_NAV_METADATA[tab],
}));

// ─── Sidebar Subsections ────────────────────────────────

export interface SubsectionItem {
  id: string;
  label: string;
}

export type SubsectionRoute = ROUTES.AGENTS | ROUTES.COSTS | ROUTES.GOVERNANCE;

export const SUBSECTIONS: Record<SubsectionRoute, SubsectionItem[]> = {
  [ROUTES.AGENTS]: [
    { id: "reliability", label: "Reliability" },
    { id: "agent-performance", label: "Agent Performance" },
    { id: "project-breakdown", label: "Project Breakdown" },
    { id: "recent-runs", label: "Recent Runs" },
  ],
  [ROUTES.COSTS]: [
    { id: "cost-summary", label: "Cost Summary" },
    { id: "cost-by-provider", label: "Cost by Provider" },
    { id: "budget-forecast", label: "Budget Forecast" },
    { id: "costs-project-breakdown", label: "Project Breakdown" },
  ],
  [ROUTES.GOVERNANCE]: [
    { id: "overview", label: "Overview" },
    { id: "team-performance", label: "Team Performance" },
    { id: "seat-user-oversight", label: "Seat User Oversight" },
    { id: "recent-violations", label: "Recent Violations" },
    { id: "security-events", label: "Security Events" },
    { id: "policy-changes", label: "Policy Changes" },
  ],
};

// ─── Helpers ────────────────────────────────────────────

export function getSubsections(route: SubsectionRoute): SubsectionItem[] {
  return SUBSECTIONS[route];
}

export function getSubsectionById(route: SubsectionRoute, id: string): SubsectionItem | undefined {
  return SUBSECTIONS[route].find((s) => s.id === id);
}

export function hasSubsections(route: ROUTES): route is SubsectionRoute {
  return route in SUBSECTIONS;
}
