# 0081 — Chat History Topic Filters (Reusable)

> Add reusable topic-filtering for chat history cards, with tab-specific default selections and shared filtering utilities for future screens.

---

## User Stories

1. As a user, I want chat history topic filters so I can quickly focus on relevant conversations.
2. As a user, I want the initial topic selection to match the tab context (Agents, Costs, Governance, Support) so filtering feels intentional.
3. As an engineer, I want topic-filter logic extracted into reusable utilities and types so other screens can reuse the same behavior.

## Prior State

- Chat history cards had no topic filter controls.
- History screen always rendered one unfiltered list.
- Timestamp formatting was reusable, but topic filter defaults/logic were not centralized.

## Target State

1. Topic taxonomy and contracts:
- Introduce typed chat topics: `Agents`, `Costs`, `Governance`, `Support`.
- Include topic on chat history summaries from the shared chat contracts/stub API.

2. Reusable filter logic:
- Add reusable helpers for:
  - default topic filters by tab
  - filtering chat history items by selected topics
- Keep helpers framework-agnostic so future screens can consume them.

3. Chat history filter component:
- Build `ChatHistoryFilters` component with topic chips/toggles.
- Support clear/reset to zero selected topics.

4. Tab-based default selection behavior:
- Home (`/dashboard/chat/history`) starts with zero selected filters.
- Agents starts with `Agents` selected.
- Costs starts with `Costs` selected.
- Governance starts with `Governance` selected.
- Settings starts with `Support` selected.

5. Data scope in history screen:
- Chat history screen should render global history items and apply topic filters client-side.
- Home zero-filter state shows all topics.

## Files to Create / Update

### Docs
- `docs/pull_requests/0081-chat-history-topic-filters.md`
- `docs/pull_requests/0000-task-manager.md`

### Chat contracts/API/service/hooks
- `src/features/chat/types/contracts.ts`
- `src/features/chat/api/stub/StubChatApi.ts`
- `src/features/chat/hooks/useChatHistory.ts`

### Reusable filter logic
- `src/features/chat/filters/topicFilters.ts` (new)
- `src/features/chat/filters/index.ts` (new)
- `src/features/chat/filters/__tests__/topicFilters.test.ts` (new)

### Reusable filter UI
- `src/features/chat/components/ChatHistoryFilters.tsx` (new)
- `src/features/chat/components/index.ts` (new)

### Screen integration
- `src/features/chat/screens/ChatHistoryScreen.tsx`

## Acceptance Criteria

- Chat history shows topic filters with options: `Agents`, `Costs`, `Governance`, `Support`.
- Home chat history starts with zero topics selected.
- Agents/Costs/Governance/Settings history start with `Agents`/`Costs`/`Governance`/`Support` selected respectively.
- Toggling topics filters visible chat cards immediately.
- Clearing filters returns to zero selected topics and shows all conversations.
- Filter logic is reusable via shared helpers (not inline-only inside screen).
- TypeScript contracts remain shared between stub and UI.

## Test Plan (Write + Run)

1. Reusable filter logic tests:
- `src/features/chat/filters/__tests__/topicFilters.test.ts`
- Verify:
  - default topic selection mapping by tab
  - zero selected => no filtering
  - selected topics => only matching items

2. Existing route/helper safety checks:
- `src/constants/__tests__/routes.test.ts`

3. Validation commands:
- `npx jest src/features/chat/filters/__tests__/topicFilters.test.ts`
- `npx jest src/constants/__tests__/routes.test.ts`
- `npx tsc --noEmit`

## Depends On

- **PR 0080** — Global chat routes + screens + shell integration
