import {
  ROUTES,
  ROUTE_TO_TAB,
  TAB_ORDER,
  TAB_ROUTES,
  TABS,
  buildEntityRoute,
  getRouteForTab,
  getTabForRoute,
  isRouteActive,
  resolveTabFromPathname,
  type TabRoute,
} from "../routes";
import type { SearchEntityType } from "@/features/analytics/types";

describe("route helpers", () => {
  it("accounts for every route in the app route registry", () => {
    expect(ROUTE_TO_TAB).toEqual({
      [ROUTES.ROOT]: null,
      [ROUTES.DASHBOARD]: TABS.DASHBOARD,
      [ROUTES.AGENTS]: TABS.AGENTS,
      [ROUTES.COSTS]: TABS.COSTS,
      [ROUTES.GOVERNANCE]: TABS.GOVERNANCE,
      [ROUTES.SETTINGS]: TABS.SETTINGS,
    });
  });

  it("keeps tab order and tab routes aligned", () => {
    expect(TAB_ORDER).toEqual([
      TABS.DASHBOARD,
      TABS.AGENTS,
      TABS.COSTS,
      TABS.GOVERNANCE,
      TABS.SETTINGS,
    ]);
    expect(TAB_ROUTES).toEqual([
      ROUTES.DASHBOARD,
      ROUTES.AGENTS,
      ROUTES.COSTS,
      ROUTES.GOVERNANCE,
      ROUTES.SETTINGS,
    ]);
  });

  it.each<[TABS, TabRoute]>([
    [TABS.DASHBOARD, ROUTES.DASHBOARD],
    [TABS.AGENTS, ROUTES.AGENTS],
    [TABS.COSTS, ROUTES.COSTS],
    [TABS.GOVERNANCE, ROUTES.GOVERNANCE],
    [TABS.SETTINGS, ROUTES.SETTINGS],
  ])("maps %s to %s both ways", (tab, route) => {
    expect(getRouteForTab(tab)).toBe(route);
    expect(getTabForRoute(route)).toBe(tab);
  });

  it.each([
    ["/dashboard", TABS.DASHBOARD],
    ["/agents", TABS.AGENTS],
    ["/costs", TABS.COSTS],
    ["/governance", TABS.GOVERNANCE],
    ["/settings", TABS.SETTINGS],
    ["/agents/agent/a1", TABS.AGENTS],
    ["/unknown", TABS.DASHBOARD],
    ["/", TABS.DASHBOARD],
    ["", TABS.DASHBOARD],
  ])("resolves %s to %s", (pathname, tab) => {
    expect(resolveTabFromPathname(pathname)).toBe(tab);
  });

  it("matches active routes for nested paths", () => {
    expect(isRouteActive("/agents", ROUTES.AGENTS)).toBe(true);
    expect(isRouteActive("/agents/agent/a1", ROUTES.AGENTS)).toBe(true);
    expect(isRouteActive("/dashboard", ROUTES.AGENTS)).toBe(false);
  });
});

describe("buildEntityRoute", () => {
  const entities: SearchEntityType[] = ["agent", "project", "team", "human", "run"];

  it.each(TAB_ORDER)("builds routes for tab %s across all entity types", (tab) => {
    for (const entity of entities) {
      const route = buildEntityRoute(tab, entity, "test-id");
      expect(route).toBe(`/${tab}/${entity}/test-id`);
    }
  });

  it("covers the full 5x5 tab/entity matrix", () => {
    let count = 0;

    for (const tab of TAB_ORDER) {
      for (const entity of entities) {
        const route = buildEntityRoute(tab, entity, `id_${count}`);
        expect(route).toMatch(new RegExp(`^/${tab}/${entity}/id_${count}$`));
        count += 1;
      }
    }

    expect(count).toBe(25);
  });

  it("encodes special characters in entity IDs", () => {
    const route = buildEntityRoute(TABS.DASHBOARD, "agent", "id with spaces/slashes");
    expect(route).toBe("/dashboard/agent/id%20with%20spaces%2Fslashes");
  });
});
