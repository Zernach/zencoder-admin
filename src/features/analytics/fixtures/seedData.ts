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
import { MODELS_BY_PROVIDER } from "../constants/providers";

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

// CellarTracker's internal company teams.
const TEAM_NAMES = ["Design", "Engineering", "Marketing", "Product"];

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

// Projects are the work each internal team owns. Engineering runs codebase
// tasks, Product builds CellarTracker features, Design produces assets, and
// Marketing runs campaigns and content.
const PROJECTS_BY_TEAM: Record<string, string[]> = {
  Engineering: [
    "API Gateway Refactor",
    "Mobile App Build Pipeline",
    "Cellar Sync Engine",
    "Search Indexing Service",
    "Database Migration",
    "CI/CD Automation",
    "Authentication Service",
    "GraphQL Schema Migration",
    "Performance Optimization",
    "Test Coverage Expansion",
    "Infrastructure as Code",
    "Bug Triage Automation",
    "Dependency Upgrades",
    "Observability Stack",
  ],
  Product: [
    "CellarChat",
    "Wine Insights",
    "Pairing Recommendations",
    "Vintage Predictions",
    "Cellar Valuation",
    "Tasting Note Generator",
    "Drink Window Alerts",
    "Collection Analytics",
    "Label Scanner",
    "Wishlist & Wantlist",
    "Community Reviews",
    "Cellar Sharing",
    "Smart Restock",
    "Producer Profiles",
  ],
  Design: [
    "Asset Generation Harness",
    "Design System Refresh",
    "Marketing Illustration Pipeline",
    "Bottle Label Mockups",
    "Icon Library",
    "Onboarding Flow Redesign",
    "Brand Photography",
    "Email Template Design",
    "Mobile UI Kit",
    "Accessibility Audit",
    "Motion & Animation Library",
    "App Store Creative",
    "Landing Page Design",
    "Data Viz Components",
  ],
  Marketing: [
    "Q3 Growth Campaign",
    "SEO Content Engine",
    "Newsletter Automation",
    "Social Media Scheduler",
    "Wine Blog Content",
    "Influencer Outreach",
    "Paid Ads Optimization",
    "Customer Lifecycle Emails",
    "Landing Page A/B Tests",
    "Press & PR Kit",
    "Referral Program",
    "Webinar & Events",
    "Brand Partnerships",
    "Retention Campaigns",
  ],
};

// AI agents are scoped to a team and named for the work they automate.
const AGENTS_BY_TEAM: Record<string, string[]> = {
  Engineering: [
    "Code Review Bot",
    "Test Generator",
    "Bug Fixer",
    "Refactor Agent",
    "PR Summarizer",
    "Dependency Updater",
    "Lint Enforcer",
    "Migration Runner",
    "Deploy Bot",
    "Incident Responder",
    "Doc Writer",
    "Schema Validator",
  ],
  Product: [
    "Feature Spec Writer",
    "User Story Generator",
    "Roadmap Planner",
    "Pairing Recommender",
    "Insights Synthesizer",
    "Feedback Analyzer",
    "Release Notes Writer",
    "Wine Data Curator",
    "Onboarding Optimizer",
    "Experiment Designer",
    "Changelog Builder",
    "Persona Researcher",
  ],
  Design: [
    "Asset Generator",
    "Mockup Builder",
    "Icon Synthesizer",
    "Illustration Agent",
    "Layout Generator",
    "Palette Designer",
    "Accessibility Checker",
    "Design QA Bot",
    "Logo Variant Agent",
    "Image Upscaler",
    "Prototype Assembler",
    "Brand Auditor",
  ],
  Marketing: [
    "Content Writer",
    "SEO Optimizer",
    "Campaign Planner",
    "Email Drafter",
    "Social Post Generator",
    "Ad Copy Agent",
    "Audience Segmenter",
    "Newsletter Builder",
    "Press Release Writer",
    "Analytics Reporter",
    "Landing Page Writer",
    "Outreach Agent",
  ],
};

const VIOLATION_REASONS = [
  "Sensitive Data Exposure Detected",
  "Unauthorized Production Access",
  "Audit Trail Missing",
  "Unapproved Code Change",
  "Unreviewed Output Shipped",
  "Off-Brand Content Generated",
  "Unapproved Model Invoked",
  "Secret or Credential Leak",
];

const SECURITY_EVENT_TYPES = [
  "Credential Access Anomaly",
  "API Query Spike",
  "Authentication Failure",
  "Audit Log Gap",
];

const POLICY_ACTIONS = [
  "Updated approved model list",
  "Modified sensitive-data redaction rules",
  "Added production-access approval workflow",
  "Changed agent action rate limit",
  "Enabled secret scanning on agent outputs",
  "Updated audit-trail retention requirements",
  "Modified code-change approval policy",
  "Changed deployment approval threshold",
  "Updated brand & content safety policy",
  "Modified agent permission scopes",
];

// Approximate blended USD pricing per 1K tokens, per provider.
const COST_PER_1K: Record<ModelProvider, { input: number; output: number }> = {
  openai: { input: 0.0025, output: 0.01 },
  anthropic: { input: 0.003, output: 0.015 },
  gemini: { input: 0.00125, output: 0.005 },
  grok: { input: 0.002, output: 0.01 },
  deepseek: { input: 0.0003, output: 0.0011 },
  mistral: { input: 0.002, output: 0.006 },
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
  // Distribute a fixed total of 14 users as evenly as possible across teams.
  const TOTAL_USERS = 14;
  const teamUserCounts = teams.map(
    (_, i) =>
      Math.floor(TOTAL_USERS / teams.length) +
      (i < TOTAL_USERS % teams.length ? 1 : 0),
  );
  for (let ti = 0; ti < teams.length; ti++) {
    const team = teams[ti]!;
    const count = teamUserCounts[ti]!;
    for (let j = 0; j < count; j++) {
      const first = pick(rng, FIRST_NAMES);
      const last = pick(rng, LAST_NAMES);
      users.push({
        id: padId("user", userCounter),
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@cellartracker.wine`,
        teamId: team.id,
      });
      userCounter++;
    }
  }

  // ── User Activity Metadata ──────────────────────────
  // Use a separate RNG so the main seed sequence is not disturbed.
  // Stagger onboarding and vary daily activity probability so that
  // the Active Users trend charts show realistic growth curves.
  const activityRng = mulberry32(seed * 3 + 137);
  const userActivityMeta: { activationDay: number; dailyProb: number }[] = [];
  for (let i = 0; i < users.length; i++) {
    // Early adopters (first ~35%) join in the first 10 days;
    // remaining users stagger through day 65.
    const earlyAdopter = i < Math.floor(users.length * 0.35);
    const activationDay = earlyAdopter
      ? randInt(activityRng, 0, 8)
      : randInt(activityRng, 5, 65);
    // Power-law-ish distribution: few power users (~85%), many casual (~25-50%)
    const raw = activityRng();
    const dailyProb = 0.25 + 0.60 * (1 - raw * raw);
    userActivityMeta.push({ activationDay, dailyProb });
  }
  // Guarantee at least one user is active from day 0 so the daily active
  // pool is never empty (matters now that the user total is small).
  if (userActivityMeta.length > 0) userActivityMeta[0]!.activationDay = 0;

  // Pre-compute which users are active each day for realistic trends
  const dailyActiveUserPool = new Map<number, User[]>();
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const dayIndex = 89 - dayOffset;
    const dayStart = new Date(REFERENCE_DATE.getTime() - dayOffset * DAY_MS);
    const dayOfWeek = dayStart.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const pool: User[] = [];
    for (let u = 0; u < users.length; u++) {
      const meta = userActivityMeta[u]!;
      if (meta.activationDay > dayIndex) continue;
      let prob = meta.dailyProb;
      if (isWeekend) prob *= 0.45;
      if (activityRng() < prob) pool.push(users[u]!);
    }
    // Ensure minimum pool so there are always users to assign runs to
    if (pool.length < 8) {
      const eligible = users.filter(
        (_, i) => userActivityMeta[i]!.activationDay <= dayIndex,
      );
      while (pool.length < 8 && eligible.length > pool.length) {
        const candidate = pick(activityRng, eligible);
        if (!pool.includes(candidate)) pool.push(candidate);
      }
    }
    dailyActiveUserPool.set(dayOffset, pool);
  }

  // ── Projects ──────────────────────────────────────────
  // Each project belongs to one internal team and is named from that
  // team's domain (Engineering → codebase work, Product → features, etc.).
  const projects: Project[] = [];
  for (let i = 0; i < 50; i++) {
    const team = teams[i % teams.length]!;
    const pool = PROJECTS_BY_TEAM[team.name] ?? [];
    const slot = Math.floor(i / teams.length);
    const baseName = pool[slot % pool.length] ?? team.name;
    const name =
      slot < pool.length ? baseName : `${baseName} ${Math.floor(slot / pool.length) + 1}`;
    projects.push({
      id: padId("proj", i + 1),
      name,
      teamId: team.id,
    });
  }

  // ── Agents ────────────────────────────────────────────
  const AGENT_DESCRIPTIONS: Record<string, string> = {
    "Code Review Bot": "Reviews open pull requests against CellarTracker engineering standards, flags risky changes, and suggests inline fixes before a human reviewer is assigned.",
    "Test Generator": "Generates unit and integration tests for new and changed code paths, prioritizing modules with low coverage and recent regressions.",
    "Pairing Recommender": "Powers the Pairing Recommendations feature — matches wines in a member's cellar to dishes, occasions, and tasting preferences.",
    "Feature Spec Writer": "Drafts product specs and user stories for upcoming CellarTracker features from discovery notes and customer feedback.",
    "Asset Generator": "Runs the asset generation harness — produces bottle imagery, marketing illustrations, and UI assets from design briefs and brand guidelines.",
    "Mockup Builder": "Generates UI mockups and component variants from product specs and the CellarTracker design system.",
    "Content Writer": "Drafts blog posts, wine guides, and campaign copy from briefs, keeping tone aligned with the CellarTracker brand voice.",
    "SEO Optimizer": "Audits and rewrites marketing pages and content for search performance, surfacing keyword gaps and metadata issues.",
  };
  const GENERIC_DESCRIPTIONS_BY_TEAM: Record<string, string[]> = {
    Engineering: [
      "Triages incoming bug reports, reproduces failures, and proposes targeted fixes with regression tests.",
      "Runs scheduled dependency upgrades, resolves version conflicts, and verifies the build stays green.",
      "Refactors legacy modules for readability and performance while preserving existing behavior and tests.",
      "Monitors deploys and production telemetry, surfacing incidents and rolling back risky releases automatically.",
      "Migrates database schemas and data, validating integrity against the previous snapshot at each step.",
      "Summarizes pull requests, links related issues, and drafts release notes for each merge.",
    ],
    Product: [
      "Synthesizes customer feedback and usage signals into prioritized feature opportunities for the roadmap.",
      "Curates and validates wine reference data so product features stay accurate and current.",
      "Designs and analyzes A/B experiments for new CellarTracker features, reporting lift with confidence intervals.",
      "Drafts release notes and changelog entries from merged work, written for CellarTracker members.",
      "Maps onboarding funnels and recommends flow changes to improve activation and retention.",
      "Generates user stories and acceptance criteria from product specs and discovery notes.",
    ],
    Design: [
      "Produces UI mockups and component variants from product specs and the CellarTracker design system.",
      "Generates on-brand icon sets and illustrations, exporting production-ready assets for engineering.",
      "Audits screens for accessibility and contrast, flagging issues against WCAG guidelines.",
      "Assembles interactive prototypes from design files so flows can be reviewed before build.",
      "Builds and tunes color palettes and themes, checking contrast across light and dark modes.",
      "Reviews shipped UI against design specs and the brand system, reporting visual regressions.",
    ],
    Marketing: [
      "Plans multi-channel campaigns, schedules content, and coordinates assets across email, social, and paid.",
      "Drafts and schedules social posts tuned to each channel's format and audience.",
      "Writes and tests ad copy variants, reallocating budget toward the best-performing creative.",
      "Segments the member base by behavior and lifecycle stage for targeted outreach.",
      "Builds lifecycle and newsletter email sequences from campaign briefs and product updates.",
      "Compiles marketing performance reports, highlighting channel ROI and pipeline trends.",
    ],
  };
  const agents: Agent[] = [];
  const usedAgentNames = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const project = pick(rng, projects);
    const team = teams.find((t) => t.id === project.teamId)!;
    const pool = AGENTS_BY_TEAM[team.name] ?? [];
    const baseName = pick(rng, pool);
    let name = baseName;
    let dup = 2;
    while (usedAgentNames.has(name)) {
      name = `${baseName} ${dup}`;
      dup++;
    }
    usedAgentNames.add(name);
    const genericPool = GENERIC_DESCRIPTIONS_BY_TEAM[team.name] ?? [];
    const description = AGENT_DESCRIPTIONS[baseName] ?? pick(rng, genericPool);
    agents.push({
      id: padId("agent", i + 1),
      name,
      description,
      projectId: project.id,
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
        ["openai", 32],
        ["anthropic", 30],
        ["gemini", 18],
        ["grok", 9],
        ["deepseek", 6],
        ["mistral", 5],
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

      const user = pick(rng, dailyActiveUserPool.get(dayOffset) ?? users);
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
        modelId: pick(rng, MODELS_BY_PROVIDER[provider]),
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
  const SEED_RULES = [
    { id: "rule_seed_1", title: "Sensitive Data Redaction" },
    { id: "rule_seed_2", title: "Production Access Control" },
    { id: "rule_seed_3", title: "Agent Action Audit Trail" },
    { id: "rule_seed_4", title: "Code Change Approval" },
    { id: "rule_seed_5", title: "Approved Model Usage" },
    { id: "rule_seed_6", title: "Brand & Content Safety" },
  ];
  const policyViolations: PolicyViolationRow[] = [];
  const violationCount = randInt(rng, 150, 200);
  for (let i = 0; i < violationCount; i++) {
    const agent = pick(rng, agents);
    const rule = pick(rng, SEED_RULES);
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
      ruleId: rule.id,
      ruleTitle: rule.title,
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
    const actor = pick(rng, users);
    const targetTeam = pick(rng, teams);
    policyChanges.push({
      id: padId("pc", i + 1),
      actorUserId: actor.id,
      actorName: actor.name,
      action: pick(rng, POLICY_ACTIONS),
      timestampIso: ts.toISOString(),
      targetTeamId: targetTeam.id,
      target: targetTeam.name,
    });
  }

  // ── Compliance Items ──────────────────────────────────
  const complianceItems: ComplianceItem[] = [
    { label: "Sensitive Data Redaction", status: "compliant" },
    { label: "Agent Action Audit Trail", status: "compliant" },
    { label: "Production Access Control", status: "compliant" },
    { label: "Approved Model Usage", status: "compliant" },
    { label: "Code Change Approval", status: "warning" },
    { label: "Brand & Content Safety", status: "warning" },
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
