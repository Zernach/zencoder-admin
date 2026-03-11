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
export type NavRoute = ROUTES.ROOT | TabRoute;

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
  rule: "rule",
  chat: "chat",
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

export function isRouteActive(pathname: string, route: NavRoute): boolean {
  if (route === ROUTES.ROOT) {
    return (
      pathname === ROUTES.ROOT
      || pathname === ROUTES.DASHBOARD
      || pathname.startsWith(`${ROUTES.DASHBOARD}/`)
    );
  }

  if (route === ROUTES.DASHBOARD && pathname === ROUTES.ROOT) {
    return true;
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

export function buildEntityRoute(
  tab: TABS,
  entityType: SearchEntityType,
  entityId: string,
): string {
  return `${getRouteForTab(tab)}/${ENTITY_SEGMENTS[entityType]}/${encodeURIComponent(entityId)}`;
}

function buildChatBaseRoute(tab: TABS): string {
  return `${getRouteForTab(tab)}/chat`;
}

export function buildChatHistoryRoute(
  tab: TABS,
  options?: { topics?: readonly string[] },
): string {
  const base = `${buildChatBaseRoute(tab)}/history`;
  if (options?.topics && options.topics.length > 0) {
    return `${base}?topics=${encodeURIComponent(options.topics.join(","))}`;
  }
  return base;
}

export function buildCreateChatRoute(tab: TABS): string {
  return `${buildChatBaseRoute(tab)}/create`;
}

export function buildChatThreadRoute(tab: TABS, chatId: string): string {
  return `${buildChatHistoryRoute(tab)}/${encodeURIComponent(chatId)}`;
}

function getPathSegments(pathname: string): string[] {
  return pathname.split("/").filter((segment) => segment.length > 0);
}

export function isChatRoute(pathname: string): boolean {
  const segments = getPathSegments(pathname);
  const tabSegment = segments[0];
  const routeSegment = segments[1];

  return (
    tabSegment != null
    && isTab(tabSegment)
    && routeSegment === "chat"
    && segments.length >= 3
  );
}

export function isChatThreadRoute(pathname: string): boolean {
  if (!isChatRoute(pathname)) {
    return false;
  }

  const segments = getPathSegments(pathname);
  return segments.length === 4 && segments[2] === "history";
}
