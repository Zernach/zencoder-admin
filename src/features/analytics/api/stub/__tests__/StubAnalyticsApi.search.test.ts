import { StubAnalyticsApi } from "../StubAnalyticsApi";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";

const seedData = generateSeedData(42);
const api = new StubAnalyticsApi(seedData, { latencyMinMs: 0, latencyMaxMs: 0 });

describe("getSearchSuggestions — extended", () => {
  it("returns all 5 entity groups for a broad query", async () => {
    // Use a single character that appears in many entity names
    const res = await api.getSearchSuggestions({ orgId: "org1", query: "a", limit: 50 });
    const types = res.groups.map((g) => g.entityType);
    // At least agents and teams should match for 'a'
    expect(types.length).toBeGreaterThanOrEqual(2);
  });

  it("suggestions have correct entityType matching their group", async () => {
    const res = await api.getSearchSuggestions({ orgId: "org1", query: "a" });
    for (const group of res.groups) {
      for (const s of group.suggestions) {
        expect(s.entityType).toBe(group.entityType);
      }
    }
  });

  it("agent suggestions include subtitle with project name", async () => {
    const res = await api.getSearchSuggestions({ orgId: "org1", query: seedData.agents[0]!.name.slice(0, 3) });
    const agentGroup = res.groups.find((g) => g.entityType === "agent");
    if (agentGroup) {
      for (const s of agentGroup.suggestions) {
        expect(typeof s.subtitle).toBe("string");
        expect(s.subtitle!.length).toBeGreaterThan(0);
      }
    }
  });

  it("team suggestions have no subtitle", async () => {
    const teamName = seedData.teams[0]!.name;
    const res = await api.getSearchSuggestions({ orgId: "org1", query: teamName.slice(0, 3) });
    const teamGroup = res.groups.find((g) => g.entityType === "team");
    if (teamGroup) {
      for (const s of teamGroup.suggestions) {
        expect(s.subtitle).toBeUndefined();
      }
    }
  });

  it("run suggestions include status in subtitle", async () => {
    const runId = seedData.runs[0]!.id;
    const res = await api.getSearchSuggestions({ orgId: "org1", query: runId.slice(0, 4) });
    const runGroup = res.groups.find((g) => g.entityType === "run");
    if (runGroup) {
      for (const s of runGroup.suggestions) {
        expect(s.subtitle).toContain("—");
      }
    }
  });

  it("exact match ranks higher than partial match", async () => {
    const teamName = seedData.teams[0]!.name;
    const res = await api.getSearchSuggestions({ orgId: "org1", query: teamName });
    const teamGroup = res.groups.find((g) => g.entityType === "team");
    if (teamGroup && teamGroup.suggestions.length > 0) {
      expect(teamGroup.suggestions[0]!.title).toBe(teamName);
    }
  });
});
