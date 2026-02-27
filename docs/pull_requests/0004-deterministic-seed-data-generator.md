# 0004 — Deterministic Seed Data Generator

> Build a seeded PRNG data factory that produces 90+ days of enterprise-scale analytics: 6 teams, 80 users, 50 projects, 30 agents, 25,000+ runs — with realistic distributions, injected outliers, failure spikes, and policy violation events.

---

## Prior State

Type contracts exist (PR 0003). No fixture data exists.

## Target State

`generateSeedData(seed?: number): SeedData` returns a fully typed, deterministic dataset. Same seed → byte-identical output.

---

## File to Create

### `src/features/analytics/fixtures/seedData.ts`

#### Seeded PRNG

Implement mulberry32 (no external dep):

```ts
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Use this for **all** random decisions. Never call `Math.random()`.

#### Entities

| Entity | Count | Details |
|--------|-------|---------|
| **Teams** | 6 | `Platform`, `ML Infrastructure`, `Frontend`, `Backend Services`, `DevOps`, `Data Science` |
| **Users** | 80 | 10–15 per team. IDs `user_001`..`user_080`. Realistic first+last names. |
| **Projects** | 50 | First 5: `Customer Support AI`, `Data Pipeline Automation`, `Code Review Assistant`, `Sales Intelligence`, `Content Generator`. Remaining 45: generated realistic names. Distributed across teams. |
| **Agents** | 30 | First 6: `Ticket Classifier`, `Response Generator`, `ETL Orchestrator`, `Data Validator`, `PR Reviewer`, `Lead Scorer`. Each linked to a project. Remaining 24: generated. |

#### Runs (25,000+)

Distributed across 90 calendar days ending at a fixed reference (`2025-02-27T23:59:59Z`).

| Dimension | Distribution |
|-----------|-------------|
| **Daily volume** | Weekday 300–400, weekend 100–150, ±15% PRNG jitter |
| **Intra-day** | 70% between 08:00–20:00 UTC, 30% off-hours |
| **Provider** | 45% `codex`, 45% `claude`, 10% `other` |
| **Status** | 72% `succeeded`, 18% `failed`, 5% `canceled`, 3% `running` (last 2h), 2% `queued` (last 30m) |
| **Failure category** | timeout 39%, model_error 26%, tool_error 17%, policy_block 11%, infra_error 7% |
| **Input tokens** | Log-normal, median ~4,000, range 500–50,000 |
| **Output tokens** | Log-normal, median ~2,000, range 200–30,000 |
| **Cost** | Codex: $0.003/$0.012 per 1K in/out. Claude: $0.008/$0.024. Other: $0.002/$0.006. |
| **Duration** | Log-normal, p50 ~2,300ms, p95 ~12,700ms, range 500–120,000ms. Failed runs ×1.5. |
| **Queue wait** | Log-normal, median ~800ms, p95 ~3,500ms, range 50–5,000ms |

#### Injected Anomalies

| Type | Count | Threshold |
|------|-------|-----------|
| Highest-cost outliers | 3 | `costUsd > 10× average` (~$30+ each) |
| Longest-duration outliers | 3 | `durationMs > 5× p95` (~60,000ms+) |
| Highest-token outliers | 3 | `totalTokens > 100,000` |
| Failure spike days | 2–3 | Override failure rate to 30–40% |

#### Outcome Data (succeeded runs only)

| Field | Distribution |
|-------|-------------|
| `prCreated` | 40% true |
| `prMerged` | 70% of prCreated |
| Tests | 60% execute tests; 88% pass rate (`testsPassed / testsExecuted`) |
| `linesAdded` | 10–500, correlated with token count |
| `linesRemoved` | 5–200 |

#### Policy & Governance Data

| Entity | Count | Details |
|--------|-------|---------|
| `PolicyViolationRow` | 150+ | Severity: 20% HIGH, 45% MEDIUM, 35% LOW. Reasons: PII Detection, Rate Limit Exceeded, Unauthorized API Access, Content Policy Violation, Data Exfiltration Attempt, Credential Exposure |
| `SecurityEventRow` | 50+ | Types: Secret Detected, Data Egress Alert, Anomalous Behavior, Authentication Failure |
| `PolicyChangeEvent` | 20+ | Admin policy rule actions |
| `ComplianceItem` | 6 | Data Retention (compliant), Access Controls (compliant), Audit Logging (compliant), Encryption at Rest (compliant), PII Protection (warning), Rate Limiting (warning) |

#### Export

```ts
export function generateSeedData(seed: number = 42): SeedData;
```

### `src/features/analytics/fixtures/index.ts`

```ts
export { generateSeedData } from "./seedData";
```

---

## Depends On

**PR 0003** — `SeedData`, `RunListRow`, `Team`, `User`, `Project`, `Agent`, and all governance types.

## Done When

```ts
const a = generateSeedData(42);
const b = generateSeedData(42);
JSON.stringify(a) === JSON.stringify(b);   // true — deterministic

a.runs.length >= 25_000;
a.teams.length === 6;
a.users.length >= 80;
a.projects.length >= 50;
a.agents.length >= 30;
a.policyViolations.length >= 140;

// Provider distribution within ±5% of 45/45/10
// At least 3 runs with costUsd > 30
// At least 2 days with failure rate > 30%
// Weekday volume > weekend volume
// npx tsc --noEmit passes
```
