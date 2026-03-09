import type {
  NavigationState,
  PartialState,
  Route,
} from "@react-navigation/native";
import { STACKS } from "@/constants/routes";

type NestedNavigationState = NavigationState | PartialState<NavigationState>;
type RouteWithNestedState = Route<string> & { state?: NestedNavigationState };

function splitRouteName(routeName: string): string[] {
  return routeName.split("/").filter((segment) => segment.length > 0);
}

function clampRouteIndex(
  state: NestedNavigationState,
  routes: readonly RouteWithNestedState[],
): number {
  if (routes.length === 0) {
    return 0;
  }

  const fallbackIndex = routes.length - 1;
  const rawIndex = typeof state.index === "number" ? state.index : fallbackIndex;
  if (rawIndex < 0) {
    return 0;
  }

  if (rawIndex >= routes.length) {
    return fallbackIndex;
  }

  return rawIndex;
}

function extractActiveRouteSegments(state: NestedNavigationState): string[] {
  const routes = state.routes as readonly RouteWithNestedState[];
  if (routes.length === 0) {
    return [];
  }

  const activeRoute = routes[clampRouteIndex(state, routes)];
  if (!activeRoute) {
    return [];
  }

  const activeSegments = splitRouteName(activeRoute.name);
  const childSegments = activeRoute.state
    ? extractActiveRouteSegments(activeRoute.state)
    : [];

  return [...activeSegments, ...childSegments];
}

export function navigationStateToSegments(
  state: NestedNavigationState,
): string[] {
  const activeSegments = extractActiveRouteSegments(state);
  if (activeSegments.length === 0) {
    return [STACKS.DASHBOARD];
  }

  if (activeSegments[0] === STACKS.DASHBOARD) {
    return activeSegments;
  }

  return [STACKS.DASHBOARD, ...activeSegments];
}

