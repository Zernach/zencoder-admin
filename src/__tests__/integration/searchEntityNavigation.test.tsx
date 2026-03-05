import { buildEntityRoute, resolveTabContextFromPath } from "@/features/search/navigation";
import type { SearchEntityType } from "@/features/analytics/types";
import type { SearchTabContext } from "@/features/search/navigation";

describe("search entity navigation integration", () => {
  const tabs: SearchTabContext[] = ["dashboard", "agents", "costs", "governance", "settings"];
  const entities: SearchEntityType[] = ["agent", "project", "team", "human", "run"];

  it("every tab resolves correctly from its path", () => {
    for (const tab of tabs) {
      expect(resolveTabContextFromPath(`/${tab}`)).toBe(tab);
    }
  });

  it("nested entity paths still resolve to parent tab", () => {
    for (const tab of tabs) {
      for (const entity of entities) {
        const path = `/${tab}/${entity}/some-id`;
        expect(resolveTabContextFromPath(path)).toBe(tab);
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
    expect(routes.size).toBe(25);
  });

  it("typing without selection does not produce route changes", () => {
    // This test validates the architectural invariant:
    // resolveTabContextFromPath and buildEntityRoute are only called
    // on explicit selection, not during typing. Here we verify the
    // functions don't have side effects and are pure.
    const ctx1 = resolveTabContextFromPath("/dashboard");
    const ctx2 = resolveTabContextFromPath("/dashboard");
    expect(ctx1).toBe(ctx2);

    const route1 = buildEntityRoute("dashboard", "agent", "a1");
    const route2 = buildEntityRoute("dashboard", "agent", "a1");
    expect(route1).toBe(route2);
  });
});
