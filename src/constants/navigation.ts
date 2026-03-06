import {
  Home,
  Bot,
  DollarSign,
  Shield,
  Settings,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ROUTES } from "./routes";

// ─── Top-Level Navigation ───────────────────────────────

export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: ROUTES;
}

export const TOP_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Home", route: ROUTES.DASHBOARD },
  { icon: Bot, label: "Agents", route: ROUTES.AGENTS },
  { icon: DollarSign, label: "Costs", route: ROUTES.COSTS },
  { icon: Shield, label: "Governance", route: ROUTES.GOVERNANCE },
  { icon: Settings, label: "Settings", route: ROUTES.SETTINGS },
];

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
    { id: "compliance-status", label: "Compliance Status" },
    { id: "seat-user-oversight", label: "Seat User Oversight" },
    { id: "recent-violations", label: "Recent Violations" },
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
