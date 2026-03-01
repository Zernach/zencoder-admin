import type {
  SeedData,
  Team,
  User,
  Project,
  Agent,
  RunListRow,
  RunStatus,
  RunFailureCategory,
  ModelProvider,
  PolicyViolationRow,
  SecurityEventRow,
  PolicyChangeEvent,
  ComplianceItem,
} from "../types";

// ─── Seeded PRNG (mulberry32) ───────────────────────────
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── PRNG Helpers ───────────────────────────────────────
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function logNormal(rng: () => number, median: number, sigma: number): number {
  const u1 = rng() || 0.001;
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(1, Math.round(median * Math.exp(sigma * z)));
}

function weighted<T>(rng: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1]![0];
}

function padId(prefix: string, n: number, width = 3): string {
  return `${prefix}_${String(n).padStart(width, "0")}`;
}

// ─── Constants ──────────────────────────────────────────
// Use current date so seed data always covers the most recent 90 days
const REFERENCE_DATE = new Date();
REFERENCE_DATE.setUTCHours(23, 59, 59, 0);
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

const TEAM_NAMES = [
  "Platform",
  "ML Infrastructure",
  "Frontend",
  "Backend Services",
  "DevOps",
  "Data Science",
];

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank",
  "Ivy", "Jack", "Kate", "Leo", "Maya", "Nate", "Olivia", "Paul",
  "Quinn", "Rosa", "Sam", "Tina", "Uma", "Vince", "Wendy", "Xander",
  "Yara", "Zane", "Aria", "Blake", "Cody", "Dara", "Eli", "Faye",
  "Gabe", "Hazel", "Iris", "Joel", "Kira", "Liam", "Mona", "Noah",
  "Opal", "Petra", "Reed", "Sara", "Troy", "Vera", "Wade", "Xena",
  "Yuki", "Zara", "Amir", "Beth", "Cruz", "Dawn", "Erik", "Fern",
  "Glen", "Hope", "Ian", "Jade", "Kent", "Luna", "Max", "Nell",
  "Omar", "Pip", "Ray", "Sky", "Tate", "Una", "Val", "Wren",
  "Axel", "Brie", "Cole", "Dee", "Finn", "Gia", "Hugh", "Ines",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Chen", "Kim", "Patel", "Shah", "Singh",
  "Park", "Das", "Muller", "Jensen", "Berg", "Lund", "Ito",
  "Sato", "Li", "Wu", "Zhang", "Liu", "Wang", "Yang",
  "Morales", "Cruz", "Reyes", "Ramos", "Santos", "Ortiz", "Ruiz",
  "Diaz", "Gutierrez", "Mendez",
];

const NAMED_PROJECTS = [
  "Customer Support AI",
  "Data Pipeline Automation",
  "Code Review Assistant",
  "Sales Intelligence",
  "Content Generator",
];

const GENERATED_PROJECT_PREFIXES = [
  "Analytics", "Monitoring", "Billing", "Auth", "Search", "Reporting",
  "Workflow", "Integration", "Migration", "Testing", "Security", "Infra",
  "Cache", "Notification", "Scheduler", "Gateway", "Config", "Logging",
  "Metrics", "Dashboard", "Deployment", "CI/CD", "Compliance", "Audit",
];

const GENERATED_PROJECT_SUFFIXES = [
  "Service", "Engine", "Pipeline", "Tool", "Framework", "Module",
  "Agent", "System", "Platform", "Hub", "API", "Processor",
];

const NAMED_AGENTS = [
  "Ticket Classifier",
  "Response Generator",
  "ETL Orchestrator",
  "Data Validator",
  "PR Reviewer",
  "Lead Scorer",
];

const GENERATED_AGENT_PREFIXES = [
  "Log", "Schema", "Test", "Deploy", "Build", "Scan", "Sync",
  "Parse", "Index", "Cache", "Route", "Alert", "Transform",
  "Validate", "Optimize", "Monitor", "Archive", "Migrate",
  "Generate", "Analyze", "Filter", "Merge", "Split", "Format",
];

const GENERATED_AGENT_SUFFIXES = [
  "Analyzer", "Runner", "Inspector", "Handler", "Worker", "Manager",
  "Checker", "Resolver", "Watcher", "Reporter",
];

const VIOLATION_REASONS = [
  "PII Detection",
  "Rate Limit Exceeded",
  "Unauthorized API Access",
  "Content Policy Violation",
  "Data Exfiltration Attempt",
  "Credential Exposure",
];

const SECURITY_EVENT_TYPES = [
  "Secret Detected",
  "Data Egress Alert",
  "Anomalous Behavior",
  "Authentication Failure",
];

const POLICY_ACTIONS = [
  "Updated rate limit policy",
  "Modified network access rule",
  "Added IP whitelist entry",
  "Changed data retention period",
  "Enabled PII redaction",
  "Updated model access controls",
  "Modified audit log retention",
  "Changed encryption settings",
  "Updated compliance policy",
  "Modified agent permissions",
];

const MODEL_IDS: Record<ModelProvider, string[]> = {
  codex: ["codex-1", "codex-2"],
  claude: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  other: ["gpt-4o", "gemini-pro"],
};

const COST_PER_1K: Record<ModelProvider, { input: number; output: number }> = {
  codex: { input: 0.003, output: 0.012 },
  claude: { input: 0.008, output: 0.024 },
  other: { input: 0.002, output: 0.006 },
};

// ─── Generator ──────────────────────────────────────────
export function generateSeedData(seed: number = 42): SeedData {
  const rng = mulberry32(seed);

  // ── Teams ─────────────────────────────────────────────
  const teams: Team[] = TEAM_NAMES.map((name, i) => ({
    id: padId("team", i + 1),
    name,
  }));

  // ── Users ─────────────────────────────────────────────
  const users: User[] = [];
  let userCounter = 1;
  const teamUserCounts = teams.map(() => randInt(rng, 11, 16));
  // Ensure total >= 80
  while (teamUserCounts.reduce((a, b) => a + b, 0) < 80) {
    teamUserCounts[teamUserCounts.length - 1]!++;
  }
  for (let ti = 0; ti < teams.length; ti++) {
    const team = teams[ti]!;
    const count = teamUserCounts[ti]!;
    for (let j = 0; j < count; j++) {
      const first = pick(rng, FIRST_NAMES);
      const last = pick(rng, LAST_NAMES);
      users.push({
        id: padId("user", userCounter),
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@zencoder.dev`,
        teamId: team.id,
      });
      userCounter++;
    }
  }

  // ── Projects ──────────────────────────────────────────
  const projects: Project[] = [];
  for (let i = 0; i < 50; i++) {
    const name =
      i < NAMED_PROJECTS.length
        ? NAMED_PROJECTS[i]!
        : `${pick(rng, GENERATED_PROJECT_PREFIXES)} ${pick(rng, GENERATED_PROJECT_SUFFIXES)}`;
    projects.push({
      id: padId("proj", i + 1),
      name,
      teamId: pick(rng, teams).id,
    });
  }

  // ── Agents ────────────────────────────────────────────
  const agents: Agent[] = [];
  for (let i = 0; i < 30; i++) {
    const name =
      i < NAMED_AGENTS.length
        ? NAMED_AGENTS[i]!
        : `${pick(rng, GENERATED_AGENT_PREFIXES)} ${pick(rng, GENERATED_AGENT_SUFFIXES)}`;
    agents.push({
      id: padId("agent", i + 1),
      name,
      projectId: pick(rng, projects).id,
    });
  }

  // ── Decide failure spike days (2–3 random days) ──────
  const failureSpikeDays = new Set<number>();
  const numSpikeDays = randInt(rng, 2, 3);
  while (failureSpikeDays.size < numSpikeDays) {
    failureSpikeDays.add(randInt(rng, 5, 85));
  }

  // ── Runs ──────────────────────────────────────────────
  const runs: RunListRow[] = [];
  let runCounter = 1;

  // Track outlier injection
  let highCostInjected = 0;
  let longDurationInjected = 0;
  let highTokenInjected = 0;

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(REFERENCE_DATE.getTime() - dayOffset * DAY_MS);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = dayStart.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Growth factor: ~20% more activity at day 0 vs day 89
    const growthFactor = 1 + 0.2 * ((89 - dayOffset) / 89);

    const baseVolume = isWeekend
      ? randInt(rng, 110, 160)
      : randInt(rng, 310, 420);
    const jitter = 1 + (rng() * 0.3 - 0.15);
    const dailyCount = Math.round(baseVolume * jitter * growthFactor);

    const isSpike = failureSpikeDays.has(dayOffset);

    for (let r = 0; r < dailyCount; r++) {
      // Intra-day distribution
      let hour: number;
      if (rng() < 0.7) {
        hour = randInt(rng, 8, 19);
      } else {
        hour = rng() < 0.5 ? randInt(rng, 0, 7) : randInt(rng, 20, 23);
      }
      const minute = randInt(rng, 0, 59);
      const second = randInt(rng, 0, 59);
      const startedAt = new Date(dayStart.getTime() + hour * HOUR_MS + minute * 60_000 + second * 1_000);

      // Provider
      const provider = weighted<ModelProvider>(rng, [
        ["codex", 45],
        ["claude", 45],
        ["other", 10],
      ]);

      // Status
      let status: RunStatus;
      const isRecent2h = dayOffset === 0 && hour >= 22;
      const isRecent30m = dayOffset === 0 && hour === 23 && minute >= 30;

      if (isRecent30m && rng() < 0.4) {
        status = "queued";
      } else if (isRecent2h && rng() < 0.3) {
        status = "running";
      } else if (isSpike) {
        status = weighted<RunStatus>(rng, [
          ["succeeded", 60],
          ["failed", 35],
          ["canceled", 5],
        ]);
      } else {
        status = weighted<RunStatus>(rng, [
          ["succeeded", 72],
          ["failed", 18],
          ["canceled", 5],
          ["running", 3],
          ["queued", 2],
        ]);
      }

      // Failure category
      let failureCategory: RunFailureCategory | undefined;
      if (status === "failed") {
        failureCategory = weighted<RunFailureCategory>(rng, [
          ["timeout", 39],
          ["model_error", 26],
          ["tool_error", 17],
          ["policy_block", 11],
          ["infra_error", 7],
        ]);
      }

      // Tokens
      let inputTokens = logNormal(rng, 4000, 0.8);
      let outputTokens = logNormal(rng, 2000, 0.8);

      // Inject high-token outlier
      if (highTokenInjected < 3 && runCounter % 8000 === 0) {
        inputTokens = randInt(rng, 60000, 90000);
        outputTokens = randInt(rng, 40000, 70000);
        highTokenInjected++;
      }

      const totalTokens = inputTokens + outputTokens;
      const costRates = COST_PER_1K[provider];
      let costUsd =
        (inputTokens / 1000) * costRates.input +
        (outputTokens / 1000) * costRates.output;

      // Inject high-cost outlier
      if (highCostInjected < 3 && runCounter % 7500 === 0) {
        costUsd = 30 + rng() * 20;
        highCostInjected++;
      }

      costUsd = Math.round(costUsd * 1_000_000) / 1_000_000;

      // Duration
      let durationMs = logNormal(rng, 2300, 0.7);
      if (status === "failed") durationMs = Math.round(durationMs * 1.5);

      // Inject long-duration outlier
      if (longDurationInjected < 3 && runCounter % 8500 === 0) {
        durationMs = randInt(rng, 60000, 120000);
        longDurationInjected++;
      }

      const queueWaitMs = logNormal(rng, 800, 0.6);

      const completedAtIso =
        status === "succeeded" || status === "failed" || status === "canceled"
          ? new Date(startedAt.getTime() + durationMs).toISOString()
          : undefined;

      const user = pick(rng, users);
      const agent = pick(rng, agents);
      const project = projects.find((p) => p.id === agent.projectId)!;

      // Outcome data (succeeded only)
      let prCreated: boolean | undefined;
      let prMerged: boolean | undefined;
      let testsExecuted: number | undefined;
      let testsPassed: number | undefined;
      let linesAdded: number | undefined;
      let linesRemoved: number | undefined;

      if (status === "succeeded") {
        prCreated = rng() < 0.4;
        prMerged = prCreated ? rng() < 0.7 : undefined;
        if (rng() < 0.6) {
          testsExecuted = randInt(rng, 5, 80);
          testsPassed = Math.round(testsExecuted * (0.75 + rng() * 0.25));
        }
        const tokenFactor = Math.min(totalTokens / 6000, 3);
        linesAdded = Math.round(randInt(rng, 10, 200) * tokenFactor);
        linesRemoved = randInt(rng, 5, 200);
      }

      runs.push({
        id: padId("run", runCounter, 6),
        status,
        failureCategory,
        teamId: user.teamId,
        userId: user.id,
        projectId: project.id,
        agentId: agent.id,
        provider,
        modelId: pick(rng, MODEL_IDS[provider]),
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
        queueWaitMs,
        durationMs,
        startedAtIso: startedAt.toISOString(),
        completedAtIso,
        prCreated,
        prMerged,
        testsExecuted,
        testsPassed,
        linesAdded,
        linesRemoved,
      });

      runCounter++;
    }
  }

  // ── Ensure outlier minimums via tail injection ────────
  while (highCostInjected < 3) {
    const idx = randInt(rng, 0, runs.length - 1);
    const run = runs[idx]!;
    run.costUsd = 30 + rng() * 25;
    highCostInjected++;
  }
  while (longDurationInjected < 3) {
    const idx = randInt(rng, 0, runs.length - 1);
    const run = runs[idx]!;
    run.durationMs = randInt(rng, 60000, 120000);
    longDurationInjected++;
  }
  while (highTokenInjected < 3) {
    const idx = randInt(rng, 0, runs.length - 1);
    const run = runs[idx]!;
    run.inputTokens = randInt(rng, 60000, 90000);
    run.outputTokens = randInt(rng, 40000, 70000);
    run.totalTokens = run.inputTokens + run.outputTokens;
    highTokenInjected++;
  }

  // ── Policy Violations ─────────────────────────────────
  const policyViolations: PolicyViolationRow[] = [];
  const violationCount = randInt(rng, 150, 200);
  for (let i = 0; i < violationCount; i++) {
    const agent = pick(rng, agents);
    const dayOffset = randInt(rng, 0, 89);
    const ts = new Date(
      REFERENCE_DATE.getTime() -
        dayOffset * DAY_MS +
        randInt(rng, 0, 23) * HOUR_MS +
        randInt(rng, 0, 59) * 60_000
    );
    policyViolations.push({
      id: padId("pv", i + 1),
      timestampIso: ts.toISOString(),
      agentId: agent.id,
      agentName: agent.name,
      reason: pick(rng, VIOLATION_REASONS),
      severity: weighted(rng, [
        ["HIGH" as const, 20],
        ["MEDIUM" as const, 45],
        ["LOW" as const, 35],
      ]),
    });
  }

  // ── Security Events ───────────────────────────────────
  const securityEvents: SecurityEventRow[] = [];
  const secEventCount = randInt(rng, 50, 80);
  for (let i = 0; i < secEventCount; i++) {
    const dayOffset = randInt(rng, 0, 89);
    const ts = new Date(
      REFERENCE_DATE.getTime() -
        dayOffset * DAY_MS +
        randInt(rng, 0, 23) * HOUR_MS +
        randInt(rng, 0, 59) * 60_000
    );
    const evtType = pick(rng, SECURITY_EVENT_TYPES);
    securityEvents.push({
      id: padId("sec", i + 1),
      type: evtType,
      description: `${evtType} detected in ${pick(rng, agents).name}`,
      timestampIso: ts.toISOString(),
    });
  }

  // ── Policy Changes ────────────────────────────────────
  const policyChanges: PolicyChangeEvent[] = [];
  const changeCount = randInt(rng, 20, 30);
  for (let i = 0; i < changeCount; i++) {
    const dayOffset = randInt(rng, 0, 89);
    const ts = new Date(
      REFERENCE_DATE.getTime() -
        dayOffset * DAY_MS +
        randInt(rng, 9, 17) * HOUR_MS
    );
    policyChanges.push({
      id: padId("pc", i + 1),
      actorUserId: pick(rng, users).id,
      action: pick(rng, POLICY_ACTIONS),
      timestampIso: ts.toISOString(),
      target: pick(rng, teams).name,
    });
  }

  // ── Compliance Items ──────────────────────────────────
  const complianceItems: ComplianceItem[] = [
    { label: "Data Retention", status: "compliant" },
    { label: "Access Controls", status: "compliant" },
    { label: "Audit Logging", status: "compliant" },
    { label: "Encryption at Rest", status: "compliant" },
    { label: "PII Protection", status: "warning" },
    { label: "Rate Limiting", status: "warning" },
  ];

  return {
    teams,
    users,
    projects,
    agents,
    runs,
    policyViolations,
    securityEvents,
    policyChanges,
    complianceItems,
  };
}
