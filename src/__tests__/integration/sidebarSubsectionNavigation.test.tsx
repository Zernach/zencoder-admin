import { SUBSECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

describe("Sidebar Subsection Navigation — contract", () => {
  it("agents subsections have matching nativeID anchors defined", () => {
    const expectedIds = ["reliability", "agent-performance", "project-breakdown", "recent-runs"];
    const agentSubs = SUBSECTIONS[ROUTES.AGENTS];
    expect(agentSubs.map((s) => s.id)).toEqual(expectedIds);
  });

  it("costs subsections have matching nativeID anchors defined", () => {
    const expectedIds = ["cost-summary", "cost-by-provider", "budget-forecast", "project-breakdown"];
    const costSubs = SUBSECTIONS[ROUTES.COSTS];
    expect(costSubs.map((s) => s.id)).toEqual(expectedIds);
  });

  it("governance subsections exactly match required five entries in order", () => {
    const govSubs = SUBSECTIONS[ROUTES.GOVERNANCE];
    expect(govSubs.length).toBe(5);
    expect(govSubs.map((s) => s.id)).toEqual([
      "overview",
      "compliance-status",
      "seat-user-oversight",
      "recent-violations",
      "policy-changes",
    ]);
    expect(govSubs.map((s) => s.label)).toEqual([
      "Overview",
      "Compliance Status",
      "Seat User Oversight",
      "Recent Violations",
      "Policy Changes",
    ]);
  });

  it("all subsection IDs are kebab-case and non-empty", () => {
    const kebabRegex = /^[a-z][a-z0-9-]*$/;
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      for (const sub of SUBSECTIONS[route]) {
        expect(sub.id).toMatch(kebabRegex);
      }
    }
  });

  it("all subsection labels are non-empty strings", () => {
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      for (const sub of SUBSECTIONS[route]) {
        expect(typeof sub.label).toBe("string");
        expect(sub.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("subsection IDs are unique within each route", () => {
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      const ids = SUBSECTIONS[route].map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
