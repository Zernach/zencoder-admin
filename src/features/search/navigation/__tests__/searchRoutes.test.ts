import { resolveTabContextFromPath, buildEntityRoute } from "../searchRoutes";
import type { SearchTabContext } from "../searchRoutes";
import type { SearchEntityType } from "@/features/analytics/types";

describe("resolveTabContextFromPath", () => {
  it.each<[string, SearchTabContext]>([
    ["/dashboard", "dashboard"],
    ["/agents", "agents"],
    ["/costs", "costs"],
    ["/governance", "governance"],
    ["/settings", "settings"],
  ])("resolves %s to %s", (pathname, expected) => {
    expect(resolveTabContextFromPath(pathname)).toBe(expected);
  });

  it("resolves nested paths to their tab context", () => {
    expect(resolveTabContextFromPath("/agents/agent/a1")).toBe("agents");
    expect(resolveTabContextFromPath("/governance/human/h1")).toBe("governance");
  });

  it("defaults to dashboard for unknown paths", () => {
    expect(resolveTabContextFromPath("/unknown")).toBe("dashboard");
    expect(resolveTabContextFromPath("/")).toBe("dashboard");
    expect(resolveTabContextFromPath("")).toBe("dashboard");
  });
});

describe("buildEntityRoute", () => {
  const tabs: SearchTabContext[] = ["dashboard", "agents", "costs", "governance", "settings"];
  const entities: SearchEntityType[] = ["agent", "project", "team", "human", "run"];

  it.each(tabs)("builds routes for tab %s across all entity types", (tab) => {
    for (const entity of entities) {
      const route = buildEntityRoute(tab, entity, "test-id");
      expect(route).toBe(`/${tab}/${entity}/test-id`);
    }
  });

  it("covers full 5x5 matrix (25 combinations)", () => {
    let count = 0;
    for (const tab of tabs) {
      for (const entity of entities) {
        const route = buildEntityRoute(tab, entity, `id_${count}`);
        expect(route).toMatch(new RegExp(`^/${tab}/${entity}/id_${count}$`));
        count++;
      }
    }
    expect(count).toBe(25);
  });

  it("encodes special characters in entity IDs", () => {
    const route = buildEntityRoute("dashboard", "agent", "id with spaces/slashes");
    expect(route).toBe("/dashboard/agent/id%20with%20spaces%2Fslashes");
  });
});
