import { AnalyticsService } from "../AnalyticsService";
import type { IAnalyticsApi } from "../../api/IAnalyticsApi";

function createMockApi(): IAnalyticsApi {
  return {
    getOverview: jest.fn(),
    getUsage: jest.fn(),
    getOutcomes: jest.fn(),
    getCost: jest.fn(),
    getReliability: jest.fn(),
    getGovernance: jest.fn(),
    getAgentsHub: jest.fn(),
    getLiveAgentSessions: jest.fn(),
    getSearchSuggestions: jest.fn(),
    getAgentDetail: jest.fn(),
    getProjectDetail: jest.fn(),
    getTeamDetail: jest.fn(),
    getHumanDetail: jest.fn(),
    getRunDetail: jest.fn(),
    createComplianceRule: jest.fn().mockResolvedValue({
      id: "rule_1",
      name: "R",
      description: "D",
      severity: "HIGH",
      createdAtIso: "2026-01-01T00:00:00Z",
    }),
    createSeat: jest.fn().mockResolvedValue({
      user: { id: "user_1", name: "A", email: "a@b.com", teamId: "t1" },
      createdAtIso: "2026-01-01T00:00:00Z",
    }),
    createProject: jest.fn().mockResolvedValue({
      project: { id: "proj_1", name: "P", teamId: "t1" },
      createdAtIso: "2026-01-01T00:00:00Z",
    }),
    createTeam: jest.fn().mockResolvedValue({
      team: { id: "team_1", name: "T" },
      createdAtIso: "2026-01-01T00:00:00Z",
    }),
    createAgent: jest.fn().mockResolvedValue({
      agent: { id: "agent_1", name: "A", projectId: "proj_1", description: "" },
      createdAtIso: "2026-01-01T00:00:00Z",
    }),
    updateAgentDescription: jest.fn().mockResolvedValue({
      agent: { id: "agent_1", name: "A", projectId: "proj_1", description: "Updated" },
    }),
  };
}

describe("AnalyticsService — createComplianceRule delegation", () => {
  it("delegates to api.createComplianceRule and returns response", async () => {
    const api = createMockApi();
    const svc = new AnalyticsService(api);
    const request = { name: "R", description: "D", severity: "HIGH" as const };
    const result = await svc.createComplianceRule(request);

    expect(api.createComplianceRule).toHaveBeenCalledWith(request);
    expect(result.id).toBe("rule_1");
  });
});

describe("AnalyticsService — createSeat delegation", () => {
  it("delegates to api.createSeat and returns response", async () => {
    const api = createMockApi();
    const svc = new AnalyticsService(api);
    const request = { name: "A", email: "a@b.com", teamId: "t1" };
    const result = await svc.createSeat(request);

    expect(api.createSeat).toHaveBeenCalledWith(request);
    expect(result.user.id).toBe("user_1");
  });
});

describe("AnalyticsService — createProject delegation", () => {
  it("delegates to api.createProject and returns response", async () => {
    const api = createMockApi();
    const svc = new AnalyticsService(api);
    const request = { name: "P", teamId: "t1" };
    const result = await svc.createProject(request);

    expect(api.createProject).toHaveBeenCalledWith(request);
    expect(result.project.id).toBe("proj_1");
  });
});

describe("AnalyticsService — createTeam delegation", () => {
  it("delegates to api.createTeam and returns response", async () => {
    const api = createMockApi();
    const svc = new AnalyticsService(api);
    const request = { name: "T" };
    const result = await svc.createTeam(request);

    expect(api.createTeam).toHaveBeenCalledWith(request);
    expect(result.team.id).toBe("team_1");
  });
});
