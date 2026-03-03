# 0029 — Live Agents

> Add a new live activity module to `/(dashboard)/dashboard` before Key Metrics: **"Live / AI Assistants in Action"**, showing only active agent sessions with animated in-progress donuts, completion checkmarks, and automatic card removal when a session completes.

---

## Prior State

The Overview dashboard started with `Key Metrics` and had no dedicated "currently running agents" surface.

## Target State

Overview now opens with a real-time-feeling "Live AI Assistants in Action" section:

- Green pulsing LIVE indicator
- Horizontal FlatList laid out as two stacked rows of cards
- Cards show:
  - Color-coded initial avatar
  - Agent + project context
  - Current task text
  - Donut spinner/progress while active
  - Checkmark animation on completion
  - Auto-removal after completion
- Section shows only active sessions (`queued`/`running`)

Data is sourced through shared TypeScript contracts and the stubbed analytics API/service/hook path (no screen-level mock duplication).

---

## Files Updated

### Shared contracts
- `src/features/analytics/types/contracts.ts`
  - Added:
    - `LiveAgentSessionStatus`
    - `LiveAgentSession`
    - `LiveAgentSessionsResponse`

### API and service interfaces
- `src/features/analytics/api/IAnalyticsApi.ts`
  - Added `getLiveAgentSessions(filters)`
- `src/features/analytics/services/IAnalyticsService.ts`
  - Added `getLiveAgentSessions(filters)`
- `src/features/analytics/services/AnalyticsService.ts`
  - Added pass-through implementation

### Stub backend
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
  - Added `getLiveAgentSessions(filters)`
  - Returns only active sessions (`queued`/`running`), recent-first, with realistic task labels and display metadata

### Hooks
- `src/features/analytics/hooks/useQueryKeyFactory.ts`
  - Added `liveAgentSessions` query key
- `src/features/analytics/hooks/useLiveAgentSessions.ts` (new)
  - Added hook for fetching/refetching live sessions

### UI
- `src/components/dashboard/LiveAssistantsSection.tsx` (new)
  - New section with live badge, two-row horizontal FlatList card layout, donut spinner animation, completion checkmark animation, and auto-removal behavior
- `src/components/dashboard/index.ts`
  - Exported `LiveAssistantsSection`
- `src/app/(dashboard)/dashboard.tsx`
  - Inserted `<LiveAssistantsSection />` above Key Metrics

### Tests
- `src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`
  - Added coverage for `getLiveAgentSessions`
- `src/features/analytics/services/__tests__/AnalyticsService.test.ts`
  - Added `getLiveAgentSessions` coverage and updated `IAnalyticsApi` mocks
- `src/features/analytics/hooks/__tests__/useLiveAgentSessions.test.ts` (new)
  - Added hook state/shape tests

---

## Done When

- The Overview dashboard shows "Live / AI Assistants in Action" before "Key Metrics / At a glance"
- LIVE indicator visually pulses green
- Cards render in a horizontal two-row layout
- Each card shows color-coded initial avatar and animated donut spinner while active
- Completing cards show checkmark animation and are removed
- Data path uses shared contracts through API interface -> service -> hook -> UI
- Only active sessions appear in this section
