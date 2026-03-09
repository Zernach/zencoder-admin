import type { SearchEntityType } from "@/features/analytics/types";

export enum STACKS {
  DASHBOARD = "(dashboard)",
}

export enum TABS {
  DASHBOARD = "dashboard",
  AGENTS = "agents",
  COSTS = "costs",
  GOVERNANCE = "governance",
  SETTINGS = "settings",
}

export enum ROUTES {
  ROOT = "/",
  DASHBOARD = "/dashboard",
  AGENTS = "/agents",
  COSTS = "/costs",
  GOVERNANCE = "/governance",
  SETTINGS = "/settings",
}

export type TabRoute = Exclude<ROUTES, ROUTES.ROOT>;

export const TAB_ORDER = [
  TABS.DASHBOARD,
  TABS.AGENTS,
  TABS.COSTS,
  TABS.GOVERNANCE,
  TABS.SETTINGS,
] as const satisfies readonly TABS[];

export const TAB_ROUTE_BY_TAB = {
  [TABS.DASHBOARD]: ROUTES.DASHBOARD,
  [TABS.AGENTS]: ROUTES.AGENTS,
  [TABS.COSTS]: ROUTES.COSTS,
  [TABS.GOVERNANCE]: ROUTES.GOVERNANCE,
  [TABS.SETTINGS]: ROUTES.SETTINGS,
} as const satisfies Record<TABS, TabRoute>;

export const TAB_BY_ROUTE = {
  [ROUTES.DASHBOARD]: TABS.DASHBOARD,
  [ROUTES.AGENTS]: TABS.AGENTS,
  [ROUTES.COSTS]: TABS.COSTS,
  [ROUTES.GOVERNANCE]: TABS.GOVERNANCE,
  [ROUTES.SETTINGS]: TABS.SETTINGS,
} as const satisfies Record<TabRoute, TABS>;

export const ROUTE_TO_TAB = {
  [ROUTES.ROOT]: null,
  ...TAB_BY_ROUTE,
} as const satisfies Record<ROUTES, TABS | null>;

export const TAB_ROUTES = TAB_ORDER.map((tab) => TAB_ROUTE_BY_TAB[tab]) as readonly TabRoute[];

const ENTITY_SEGMENTS: Record<SearchEntityType, string> = {
  agent: "agent",
  project: "project",
  team: "team",
  human: "human",
  run: "run",
};

const TAB_SET = new Set<string>(TAB_ORDER);

export function isTab(value: string): value is TABS {
  return TAB_SET.has(value);
}

export function getRouteForTab(tab: TABS): TabRoute {
  return TAB_ROUTE_BY_TAB[tab];
}

export function getTabForRoute(route: TabRoute): TABS {
  return TAB_BY_ROUTE[route];
}

export function resolveTabFromPathname(pathname: string): TABS {
  const [segment] = pathname.split("/").filter((value) => value.length > 0);
  return segment != null && isTab(segment) ? segment : TABS.DASHBOARD;
}

export function isRouteActive(pathname: string, route: TabRoute): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function buildEntityRoute(
  tab: TABS,
  entityType: SearchEntityType,
  entityId: string,
): string {
  return `${getRouteForTab(tab)}/${ENTITY_SEGMENTS[entityType]}/${encodeURIComponent(entityId)}`;
}
