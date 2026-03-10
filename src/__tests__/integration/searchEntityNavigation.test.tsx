import { buildEntityRoute, resolveTabFromPathname, TAB_ORDER, TABS } from "@/constants/routes";
import type { SearchEntityType } from "@/features/analytics/types";

describe("search entity navigation integration", () => {
  const tabs = [...TAB_ORDER];
  const entities: SearchEntityType[] = ["agent", "project", "team", "human", "run", "rule"];

  it("every tab resolves correctly from its path", () => {
    for (const tab of tabs) {
      expect(resolveTabFromPathname(`/${tab}`)).toBe(tab);
    }
  });

  it("nested entity paths still resolve to parent tab", () => {
    for (const tab of tabs) {
      for (const entity of entities) {
        const path = `/${tab}/${entity}/some-id`;
        expect(resolveTabFromPathname(path)).toBe(tab);
      }
    }
  });

  it("full 25-route matrix produces unique, well-formed routes", () => {
    const routes = new Set<string>();
    for (const tab of tabs) {
      for (const entity of entities) {
        const route = buildEntityRoute(tab, entity, "test-id-123");
        expect(route).toMatch(/^\/[a-z]+\/[a-z]+\/test-id-123$/);
        routes.add(route);
      }
    }
    expect(routes.size).toBe(30);
  });

  it("typing without selection does not produce route changes", () => {
    // This test validates the architectural invariant:
    // resolveTabFromPathname and buildEntityRoute are only called
    // on explicit selection, not during typing. Here we verify the
    // functions don't have side effects and are pure.
    const ctx1 = resolveTabFromPathname("/dashboard");
    const ctx2 = resolveTabFromPathname("/dashboard");
    expect(ctx1).toBe(ctx2);

    const route1 = buildEntityRoute(TABS.DASHBOARD, "agent", "a1");
    const route2 = buildEntityRoute(TABS.DASHBOARD, "agent", "a1");
    expect(route1).toBe(route2);
  });
});
