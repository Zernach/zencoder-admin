import type { SearchEntityType } from "@/features/analytics/types";

export type SearchTabContext = "dashboard" | "agents" | "costs" | "governance" | "settings";

const TAB_CONTEXTS: SearchTabContext[] = ["dashboard", "agents", "costs", "governance", "settings"];

const ENTITY_SEGMENTS: Record<SearchEntityType, string> = {
  agent: "agent",
  project: "project",
  team: "team",
  human: "human",
  run: "run",
};

export function resolveTabContextFromPath(pathname: string): SearchTabContext {
  const normalized = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const segment = normalized.split("/")[0] ?? "";
  if (TAB_CONTEXTS.includes(segment as SearchTabContext)) {
    return segment as SearchTabContext;
  }
  return "dashboard";
}

export function buildEntityRoute(
  tabContext: SearchTabContext,
  entityType: SearchEntityType,
  entityId: string,
): string {
  const segment = ENTITY_SEGMENTS[entityType];
  return `/${tabContext}/${segment}/${encodeURIComponent(entityId)}`;
}
