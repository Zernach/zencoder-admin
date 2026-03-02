# 0028 — Run Detail Prompt Chain & Per-Message Cost Ballooning

> Extend `/(dashboard)/runs/[runId]` to show the prompt chain conversation that occurred with the LLM and attribute cost to each individual message. The UI must clearly show ballooning cost as the context window grows over the chain.

---

## Prior State

The run detail screen shows overview, context, timeline, artifacts, and policy context. `RunDetailResponse` does not include prompt-chain messages or per-message token/cost attribution.

## Target State

`/(dashboard)/runs/[runId]` includes a new prompt-chain forensics experience:

- Full conversation chain in chronological order (system/user/assistant/tool messages)
- Per-message token and cost breakdown
- Cumulative context-window growth and cumulative spend visualization
- Clear indication that later messages cost more as context accumulates

All data comes from shared TypeScript contracts and stubbed API responses (no duplicated types, no screen-level hardcoded mock rows).

---

## Files to Update

### `src/features/analytics/types/contracts.ts`

Add shared contracts for prompt-chain details used by both frontend and stub API:

```ts
export type PromptRole = "system" | "user" | "assistant" | "tool";

export interface RunPromptMessageCost {
  id: string;
  order: number;
  role: PromptRole;
  content: string;
  contextTokensBefore: number;
  inputTokens: number;
  outputTokens: number;
  contextTokensAfter: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  cumulativeCostUsd: number;
}

export interface RunPromptChainSummary {
  totalMessages: number;
  maxContextTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
}
```

Extend `RunDetailResponse`:

```ts
export interface RunDetailResponse {
  run: RunListRow;
  timeline: RunTimelineEvent[];
  artifacts: RunArtifacts;
  policyContext: PolicyContext;
  promptChain: RunPromptMessageCost[];
  promptChainSummary: RunPromptChainSummary;
}
```

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

- Generate realistic prompt-chain data per run (8-16 messages, mixed roles)
- Compute context growth by carrying prior message tokens forward
- Compute per-message input/output/total/cumulative costs
- Ensure sum of message costs aligns with run-level cost within rounding tolerance
- Keep latency/error simulation behavior unchanged

### `src/features/analytics/services/AnalyticsService.ts`

- Normalize prompt-chain money fields to 2 decimals
- Keep API signatures unchanged while returning the enriched `RunDetailResponse`

### `src/features/analytics/hooks/useRunDetail.ts`

- Keep screen orchestration responsibilities the same
- Return prompt-chain-ready data in `{ data, loading, error, refetch }` shape

### `src/features/analytics/mappers/runDetailMappers.ts` (new)

Add a mapper for UI-oriented prompt-chain view models and chart series:

- Conversation rows with role labels + text preview
- Message cost rows for table rendering
- Cumulative token and cost trend points keyed by message order
- Ballooning ratio (`contextTokensAfter / max(1, firstMessageInputTokens)`) for visual emphasis

### `src/app/(dashboard)/runs/[runId].tsx`

Add two new sections after timeline/artifacts:

1. Prompt Chain Conversation
- Message cards in chronological order
- Role badge, content preview, and message-level token/cost stats

2. Cost Growth by Context Window
- Table columns:
  - `#`
  - `Role`
  - `Context Before`
  - `Input Tokens`
  - `Output Tokens`
  - `Message Cost`
  - `Cumulative Cost`
- Trend visualization showing context-token growth and cumulative spend across message index
- Copy/labels that explicitly call out ballooning cost from larger context windows

### `src/features/analytics/hooks/__tests__/useRunDetail.test.ts` (new or update)
### `src/app/(dashboard)/runs/__tests__/runDetailScreen.test.tsx` (new)
### `src/features/analytics/services/__tests__/AnalyticsService.test.ts` (update)

Add coverage for:
- Prompt-chain rendering
- Per-message and cumulative cost display
- Monotonic context/cumulative-cost growth
- Empty-state handling when `promptChain` is unavailable

---

## Depends On

- **PR 0003** — shared type contracts
- **PR 0005** — analytics API interface + stub implementation
- **PR 0006** — service layer
- **PR 0011** — table components
- **PR 0016** — run detail screen baseline

## Done When

- `/runs/[runId]` displays the message-by-message prompt chain conversation
- Every message row shows role, context-before, input/output tokens, message cost, cumulative cost
- Context tokens and cumulative cost visibly increase through the chain
- Users can identify ballooning cost in late-chain messages at a glance
- Data is sourced through shared contracts used by stub API + frontend (single source of truth)
- Loading, empty, and error states remain correct for run detail

