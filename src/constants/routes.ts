import type { SearchEntityType } from "@/features/analytics/types";

export enum STACKS {
  DASHBOARD = "(dashboard)",
}

export enum TABS {
  DASHBOARD = "dashboard",
  AGENTS = "agents",
  COSTS = "costs",
  GOVERNANCE = "governance",
  CHAT = "chat",
  SETTINGS = "settings",
}

export enum ROUTES {
  ROOT = "/",
  DASHBOARD = "/dashboard",
  AGENTS = "/agents",
  COSTS = "/costs",
  GOVERNANCE = "/governance",
  CHAT = "/chat",
  SETTINGS = "/settings",
}

export type TabRoute = Exclude<ROUTES, ROUTES.ROOT>;
export type NavRoute = ROUTES.ROOT | TabRoute;

export const TAB_ORDER = [
  TABS.DASHBOARD,
  TABS.AGENTS,
  TABS.COSTS,
  TABS.GOVERNANCE,
  TABS.CHAT,
  TABS.SETTINGS,
] as const satisfies readonly TABS[];

export const TAB_ROUTE_BY_TAB = {
  [TABS.DASHBOARD]: ROUTES.DASHBOARD,
  [TABS.AGENTS]: ROUTES.AGENTS,
  [TABS.COSTS]: ROUTES.COSTS,
  [TABS.GOVERNANCE]: ROUTES.GOVERNANCE,
  [TABS.CHAT]: ROUTES.CHAT,
  [TABS.SETTINGS]: ROUTES.SETTINGS,
} as const satisfies Record<TABS, TabRoute>;

export const TAB_BY_ROUTE = {
  [ROUTES.DASHBOARD]: TABS.DASHBOARD,
  [ROUTES.AGENTS]: TABS.AGENTS,
  [ROUTES.COSTS]: TABS.COSTS,
  [ROUTES.GOVERNANCE]: TABS.GOVERNANCE,
  [ROUTES.CHAT]: TABS.CHAT,
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

export function resolveTabFromSegments(segments: readonly string[]): TABS | null {
  const dashboardStackIndex = segments.indexOf(STACKS.DASHBOARD);
  const candidateSegments =
    dashboardStackIndex >= 0 ? segments.slice(dashboardStackIndex + 1) : segments;

  for (const segment of candidateSegments) {
    if (isTab(segment)) {
      return segment;
    }
  }

  return null;
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
  if (entityType === "chat") {
    return buildChatThreadRoute(tab, entityId);
  }

  return `${getRouteForTab(tab)}/${ENTITY_SEGMENTS[entityType]}/${encodeURIComponent(entityId)}`;
}

function buildChatQuery(
  tab: TABS,
  options?: { topics?: readonly string[] },
): string {
  const params = new URLSearchParams();
  if (tab !== TABS.CHAT) {
    params.set("tab", tab);
  }

  if (options?.topics && options.topics.length > 0) {
    params.set("topics", options.topics.join(","));
  }

  const query = params.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function buildChatHistoryRoute(
  tab: TABS,
  options?: { topics?: readonly string[] },
): string {
  return `${ROUTES.CHAT}${buildChatQuery(tab, options)}`;
}

export function buildCreateChatRoute(): string {
  return `${ROUTES.CHAT}/create`;
}

export function buildChatThreadRoute(tab: TABS, chatId: string): string {
  return `${ROUTES.CHAT}/${encodeURIComponent(chatId)}${buildChatQuery(tab)}`;
}

function getPathSegments(pathname: string): string[] {
  return pathname.split("/").filter((segment) => segment.length > 0);
}

export function isChatRoute(pathname: string): boolean {
  const segments = getPathSegments(pathname);
  return segments[0] === TABS.CHAT;
}

export function isChatThreadRoute(pathname: string): boolean {
  if (!isChatRoute(pathname)) {
    return false;
  }

  const segments = getPathSegments(pathname);
  return segments.length === 2 && segments[1] !== "create" && segments[1] !== "history";
}

export function isChatHistoryRoute(pathname: string): boolean {
  if (!isChatRoute(pathname)) {
    return false;
  }

  const segments = getPathSegments(pathname);
  return segments.length === 1;
}
