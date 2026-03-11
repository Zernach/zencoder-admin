import {
  Home,
  Bot,
  DollarSign,
  Shield,
  Settings,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ROUTES, TABS, TAB_ORDER, getRouteForTab, type NavRoute } from "./routes";

// ─── Top-Level Navigation ───────────────────────────────

export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: NavRoute;
  tab: TABS;
}

const TOP_NAV_METADATA: Record<TABS, Pick<NavItem, "icon" | "label">> = {
  [TABS.DASHBOARD]: { icon: Home, label: "navigation.home" },
  [TABS.AGENTS]: { icon: Bot, label: "navigation.agents" },
  [TABS.COSTS]: { icon: DollarSign, label: "navigation.costs" },
  [TABS.GOVERNANCE]: { icon: Shield, label: "navigation.governance" },
  [TABS.SETTINGS]: { icon: Settings, label: "navigation.settings" },
};

export const TOP_NAV_ITEMS: NavItem[] = TAB_ORDER.map((tab) => ({
  tab,
  route: tab === TABS.DASHBOARD ? ROUTES.ROOT : getRouteForTab(tab),
  ...TOP_NAV_METADATA[tab],
}));

// ─── Sidebar Subsections ────────────────────────────────

export interface SubsectionItem {
  id: string;
  label: string;
}

export type SubsectionRoute = ROUTES.ROOT | ROUTES.AGENTS | ROUTES.COSTS | ROUTES.GOVERNANCE | ROUTES.SETTINGS;

export const SUBSECTIONS: Record<SubsectionRoute, SubsectionItem[]> = {
  [ROUTES.ROOT]: [
    { id: "live-assistants", label: "navigation.subsections.liveAssistants" },
    { id: "trends", label: "navigation.subsections.trends" },
    { id: "outcomes", label: "navigation.subsections.outcomes" },
    { id: "key-metrics", label: "navigation.subsections.keyMetrics" },
  ],
  [ROUTES.AGENTS]: [
    { id: "reliability", label: "navigation.subsections.reliability" },
    { id: "agent-performance", label: "navigation.subsections.agentPerformance" },
    { id: "project-breakdown", label: "navigation.subsections.projectBreakdown" },
    { id: "recent-runs", label: "navigation.subsections.recentRuns" },
  ],
  [ROUTES.COSTS]: [
    { id: "budget-forecast", label: "navigation.subsections.budgetForecast" },
    { id: "cost-summary", label: "navigation.subsections.costSummary" },
    { id: "cost-by-provider", label: "navigation.subsections.costByProvider" },
  ],
  [ROUTES.GOVERNANCE]: [
    { id: "team-performance", label: "navigation.subsections.teamPerformance" },
    { id: "seat-user-oversight", label: "navigation.subsections.seatUserOversight" },
    { id: "rules", label: "navigation.subsections.rules" },
    { id: "recent-violations", label: "navigation.subsections.violations" },
    { id: "policy-changes", label: "navigation.subsections.policyChanges" },
    { id: "security-events", label: "navigation.subsections.securityEvents" },
  ],
  [ROUTES.SETTINGS]: [
    { id: "preferences", label: "navigation.subsections.preferences" },
    { id: "internationalization", label: "navigation.subsections.internationalization" },
    { id: "organization", label: "navigation.subsections.organization" },
    { id: "danger-zone", label: "navigation.subsections.dangerZone" },
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
