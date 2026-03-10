import {
  TOP_NAV_ITEMS,
  SUBSECTIONS,
  getSubsections,
  getSubsectionById,
  hasSubsections,
} from "../navigation";
import { ROUTES } from "../routes";

describe("TOP_NAV_ITEMS", () => {
  it("contains all 5 top-level routes", () => {
    const routes = TOP_NAV_ITEMS.map((item) => item.route);
    expect(routes).toContain(ROUTES.DASHBOARD);
    expect(routes).toContain(ROUTES.AGENTS);
    expect(routes).toContain(ROUTES.COSTS);
    expect(routes).toContain(ROUTES.GOVERNANCE);
    expect(routes).toContain(ROUTES.SETTINGS);
    expect(TOP_NAV_ITEMS.length).toBe(5);
  });

  it("each item has icon, label, and route", () => {
    for (const item of TOP_NAV_ITEMS) {
      expect(item.icon).toBeDefined();
      expect(typeof item.label).toBe("string");
      expect(item.label.length).toBeGreaterThan(0);
      expect(typeof item.route).toBe("string");
    }
  });
});

describe("SUBSECTIONS", () => {
  it("defines subsections for agents, costs, and governance", () => {
    expect(SUBSECTIONS[ROUTES.AGENTS]).toBeDefined();
    expect(SUBSECTIONS[ROUTES.COSTS]).toBeDefined();
    expect(SUBSECTIONS[ROUTES.GOVERNANCE]).toBeDefined();
  });

  it("agents has 4 subsections", () => {
    const items = SUBSECTIONS[ROUTES.AGENTS];
    expect(items.length).toBe(4);
    expect(items.map((i) => i.label)).toEqual([
      "navigation.subsections.reliability",
      "navigation.subsections.agentPerformance",
      "navigation.subsections.projectBreakdown",
      "navigation.subsections.recentRuns",
    ]);
  });

  it("costs has 4 subsections", () => {
    const items = SUBSECTIONS[ROUTES.COSTS];
    expect(items.length).toBe(4);
    expect(items.map((i) => i.label)).toEqual([
      "navigation.subsections.costSummary",
      "navigation.subsections.costByProvider",
      "navigation.subsections.budgetForecast",
      "navigation.subsections.projectBreakdown",
    ]);
  });

  it("governance has 6 subsections", () => {
    const items = SUBSECTIONS[ROUTES.GOVERNANCE];
    expect(items.length).toBe(6);
    expect(items.map((i) => i.label)).toEqual([
      "navigation.subsections.overview",
      "navigation.subsections.teamPerformance",
      "navigation.subsections.seatUserOversight",
      "navigation.subsections.recentViolations",
      "navigation.subsections.securityEvents",
      "navigation.subsections.policyChanges",
    ]);
  });

  it("each subsection has stable id and label", () => {
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      for (const item of SUBSECTIONS[route]) {
        expect(typeof item.id).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.label).toBe("string");
        expect(item.label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("getSubsections", () => {
  it("returns subsections for a given route", () => {
    const items = getSubsections(ROUTES.GOVERNANCE);
    expect(items.length).toBe(6);
    expect(items[0]!.id).toBe("overview");
  });
});

describe("getSubsectionById", () => {
  it("finds a subsection by id", () => {
    const item = getSubsectionById(ROUTES.AGENTS, "reliability");
    expect(item).toBeDefined();
    expect(item!.label).toBe("navigation.subsections.reliability");
  });

  it("returns undefined for unknown id", () => {
    const item = getSubsectionById(ROUTES.AGENTS, "nonexistent");
    expect(item).toBeUndefined();
  });
});

describe("hasSubsections", () => {
  it("returns true for routes with subsections", () => {
    expect(hasSubsections(ROUTES.AGENTS)).toBe(true);
    expect(hasSubsections(ROUTES.COSTS)).toBe(true);
    expect(hasSubsections(ROUTES.GOVERNANCE)).toBe(true);
  });

  it("returns false for routes without subsections", () => {
    expect(hasSubsections(ROUTES.DASHBOARD)).toBe(false);
    expect(hasSubsections(ROUTES.SETTINGS)).toBe(false);
  });
});
