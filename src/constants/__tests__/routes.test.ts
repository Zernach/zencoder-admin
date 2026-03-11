import {
  ROUTES,
  ROUTE_TO_TAB,
  TAB_ORDER,
  TAB_ROUTES,
  TABS,
  buildChatHistoryRoute,
  buildChatThreadRoute,
  buildEntityRoute,
  getRouteForTab,
  getTabForRoute,
  isChatRoute,
  isChatHistoryRoute,
  isChatThreadRoute,
  isRouteActive,
  resolveTabFromSegments,
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
      [ROUTES.CHAT]: TABS.CHAT,
      [ROUTES.SETTINGS]: TABS.SETTINGS,
    });
  });

  it("keeps tab order and tab routes aligned", () => {
    expect(TAB_ORDER).toEqual([
      TABS.DASHBOARD,
      TABS.AGENTS,
      TABS.COSTS,
      TABS.GOVERNANCE,
      TABS.CHAT,
      TABS.SETTINGS,
    ]);
    expect(TAB_ROUTES).toEqual([
      ROUTES.DASHBOARD,
      ROUTES.AGENTS,
      ROUTES.COSTS,
      ROUTES.GOVERNANCE,
      ROUTES.CHAT,
      ROUTES.SETTINGS,
    ]);
  });

  it.each<[TABS, TabRoute]>([
    [TABS.DASHBOARD, ROUTES.DASHBOARD],
    [TABS.AGENTS, ROUTES.AGENTS],
    [TABS.COSTS, ROUTES.COSTS],
    [TABS.GOVERNANCE, ROUTES.GOVERNANCE],
    [TABS.CHAT, ROUTES.CHAT],
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
    ["/chat", TABS.CHAT],
    ["/settings", TABS.SETTINGS],
    ["/agents/agent/a1", TABS.AGENTS],
    ["/unknown", TABS.DASHBOARD],
    ["/", TABS.DASHBOARD],
    ["", TABS.DASHBOARD],
  ])("resolves %s to %s", (pathname, tab) => {
    expect(resolveTabFromPathname(pathname)).toBe(tab);
  });

  it.each([
    [["(dashboard)", "dashboard", "chat", "history"], TABS.DASHBOARD],
    [["(dashboard)", "agents", "chat", "history"], TABS.AGENTS],
    [["chat", "create"], TABS.CHAT],
    [["settings", "chat", "history"], TABS.SETTINGS],
    [["auth", "login"], null],
    [[], null],
  ])("resolves segments %j to %s", (segments, expected) => {
    expect(resolveTabFromSegments(segments)).toBe(expected);
  });

  it("matches active routes for nested paths", () => {
    expect(isRouteActive("/", ROUTES.ROOT)).toBe(true);
    expect(isRouteActive("/dashboard", ROUTES.ROOT)).toBe(true);
    expect(isRouteActive("/dashboard/agent/a1", ROUTES.ROOT)).toBe(true);
    expect(isRouteActive("/agents", ROUTES.ROOT)).toBe(false);
    expect(isRouteActive("/", ROUTES.DASHBOARD)).toBe(true);
    expect(isRouteActive("/", ROUTES.AGENTS)).toBe(false);
    expect(isRouteActive("/agents", ROUTES.AGENTS)).toBe(true);
    expect(isRouteActive("/agents/agent/a1", ROUTES.AGENTS)).toBe(true);
    expect(isRouteActive("/dashboard", ROUTES.AGENTS)).toBe(false);
  });
});

describe("buildEntityRoute", () => {
  const entities: SearchEntityType[] = ["agent", "project", "team", "human", "run", "rule"];

  it.each(TAB_ORDER)("builds routes for tab %s across all entity types", (tab) => {
    for (const entity of entities) {
      const route = buildEntityRoute(tab, entity, "test-id");
      expect(route).toBe(`/${tab}/${entity}/test-id`);
    }
  });

  it("covers the full 6x6 tab/entity matrix", () => {
    let count = 0;

    for (const tab of TAB_ORDER) {
      for (const entity of entities) {
        const route = buildEntityRoute(tab, entity, `id_${count}`);
        expect(route).toMatch(new RegExp(`^/${tab}/${entity}/id_${count}$`));
        count += 1;
      }
    }

    expect(count).toBe(36);
  });

  it("encodes special characters in entity IDs", () => {
    const route = buildEntityRoute(TABS.DASHBOARD, "agent", "id with spaces/slashes");
    expect(route).toBe("/dashboard/agent/id%20with%20spaces%2Fslashes");
  });

  it("routes chat entities to the dedicated /chat stack", () => {
    const route = buildEntityRoute(TABS.AGENTS, "chat", "thread 1/alpha");
    expect(route).toBe("/chat/thread%201%2Falpha?tab=agents");
  });
});

describe("chat route helpers", () => {
  it.each([
    [TABS.DASHBOARD, "/chat?tab=dashboard"],
    [TABS.AGENTS, "/chat?tab=agents"],
    [TABS.COSTS, "/chat?tab=costs"],
    [TABS.GOVERNANCE, "/chat?tab=governance"],
    [TABS.CHAT, "/chat"],
    [TABS.SETTINGS, "/chat?tab=settings"],
  ])("builds chat history route for %s", (tab, expectedRoute) => {
    expect(buildChatHistoryRoute(tab)).toBe(expectedRoute);
  });

  it("builds encoded thread route", () => {
    const route = buildChatThreadRoute(TABS.SETTINGS, "thread 1/alpha");
    expect(route).toBe("/chat/thread%201%2Falpha?tab=settings");
  });

  it.each([
    ["/chat", true],
    ["/chat/create", true],
    ["/chat/thread-1", true],
    ["/chat/history", true],
    ["/governance", false],
    ["/", false],
  ])("detects chat routes for %s", (pathname, expected) => {
    expect(isChatRoute(pathname)).toBe(expected);
  });

  it.each([
    ["/chat/thread-1", true],
    ["/chat/history", false],
    ["/chat/create", false],
    ["/chat", false],
    ["/settings/chat", false],
    ["/settings", false],
  ])("detects chat thread routes for %s", (pathname, expected) => {
    expect(isChatThreadRoute(pathname)).toBe(expected);
  });

  it.each([
    ["/chat", true],
    ["/chat/thread-1", false],
    ["/chat/create", false],
    ["/settings/chat/create", false],
    ["/governance", false],
  ])("detects chat history routes for %s", (pathname, expected) => {
    expect(isChatHistoryRoute(pathname)).toBe(expected);
  });
});
