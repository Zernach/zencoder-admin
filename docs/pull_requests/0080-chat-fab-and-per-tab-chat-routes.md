# 0080 — Global Chat FAB + Per-Tab Chat Routes

> Add a global floating chat action button across the app shell and introduce stack-local chat routes for every tab: `/[tab]/chat`, `/[tab]/chat/[chatId]`, and `/[tab]/chat/history`.

---

## User Stories

1. As an admin user, I want a persistent floating chat button on every screen so I can jump into chat without leaving my current tab context.
2. As an admin user, I want tab-scoped chat routes (dashboard, agents, costs, governance, settings) so chat navigation stays consistent with the rest of stack-local routing.
3. As an engineer, I want chat UI to consume typed stubbed contracts behind interfaces so we can swap to real backend APIs later without changing screen code.

## Prior State

- No floating chat action button exists in the shell.
- No chat routes exist under tab stacks.
- No chat feature contracts/services/stub API exist.

## Target State

1. Global floating action button:
- Render a floating action chat button in the lower-right corner of every app-shell screen.
- Position it above the mobile tab bar and safe area insets.
- Button resolves current tab from pathname and routes to that tab’s chat home.
- Hide FAB on any chat route (`/[tab]/chat`, `/[tab]/chat/history`, `/[tab]/chat/[chatId]`) to avoid redundant entry actions.

2. Tab-scoped chat routes:
- Add the following routes in each tab stack (`dashboard`, `agents`, `costs`, `governance`, `settings`):
  - `chat/index.tsx` (`/[tab]/chat`)
  - `chat/[chatId].tsx` (`/[tab]/chat/[chatId]`)
  - `chat/history.tsx` (`/[tab]/chat/history`)
- Use thin route wrappers so route files stay minimal and reusable.

3. Shared chat feature architecture (typed + swappable):
- Define chat request/response/domain contracts once in `src/features/chat/types`.
- Add `IChatApi` + `StubChatApi` with realistic sample data and simulated latency.
- Add `IChatService` + `ChatService` so hooks depend on service abstractions.
- Wire chat dependencies through app DI provider (`AppDependenciesProvider`).
- Build chat hooks for history and thread state (`data/loading/error/refetch`).

4. Shared chat screens:
- `ChatHomeScreen` for recent chats and quick navigation.
- `ChatHistoryScreen` for full conversation history in current tab.
- `ChatThreadScreen` for message timeline by `chatId`.
- `ChatThreadScreen` includes a keyboard-sliding message composer and hides mobile bottom tabs while active.

5. Route helper contracts:
- Add typed route helpers for chat home/history/thread path generation.
- Preserve existing route behavior for home/tab/entity navigation.

## Files to Create / Update

### Docs
- `docs/pull_requests/0080-chat-fab-and-per-tab-chat-routes.md`
- `docs/pull_requests/0000-task-manager.md`

### Shell / navigation
- `src/components/shell/FloatingChatButton.tsx` (new)
- `src/components/shell/DashboardShell.tsx`
- `src/components/shell/index.ts`
- `src/constants/routes.ts`
- `src/constants/__tests__/routes.test.ts`

### Chat feature (contracts, API, service, hooks, screens)
- `src/features/chat/types/contracts.ts` (new)
- `src/features/chat/types/index.ts` (new)
- `src/features/chat/api/IChatApi.ts` (new)
- `src/features/chat/api/stub/StubChatApi.ts` (new)
- `src/features/chat/api/index.ts` (new)
- `src/features/chat/services/IChatService.ts` (new)
- `src/features/chat/services/ChatService.ts` (new)
- `src/features/chat/services/index.ts` (new)
- `src/features/chat/hooks/useChatHistory.ts` (new)
- `src/features/chat/hooks/useChatThread.ts` (new)
- `src/features/chat/hooks/index.ts` (new)
- `src/features/chat/screens/ChatHomeScreen.tsx` (new)
- `src/features/chat/screens/ChatHistoryScreen.tsx` (new)
- `src/features/chat/screens/ChatThreadScreen.tsx` (new)
- `src/features/chat/screens/index.ts` (new)

### DI
- `src/core/di/AppDependencies.tsx`

### Shared route wrappers
- `src/components/routes/ChatHomeRoute.tsx` (new)
- `src/components/routes/ChatHistoryRoute.tsx` (new)
- `src/components/routes/ChatThreadRoute.tsx` (new)
- `src/components/routes/index.ts`

### Per-tab route files (15 total)
- `src/app/(dashboard)/dashboard/chat/index.tsx`
- `src/app/(dashboard)/dashboard/chat/[chatId].tsx`
- `src/app/(dashboard)/dashboard/chat/history.tsx`
- `src/app/(dashboard)/agents/chat/index.tsx`
- `src/app/(dashboard)/agents/chat/[chatId].tsx`
- `src/app/(dashboard)/agents/chat/history.tsx`
- `src/app/(dashboard)/costs/chat/index.tsx`
- `src/app/(dashboard)/costs/chat/[chatId].tsx`
- `src/app/(dashboard)/costs/chat/history.tsx`
- `src/app/(dashboard)/governance/chat/index.tsx`
- `src/app/(dashboard)/governance/chat/[chatId].tsx`
- `src/app/(dashboard)/governance/chat/history.tsx`
- `src/app/(dashboard)/settings/chat/index.tsx`
- `src/app/(dashboard)/settings/chat/[chatId].tsx`
- `src/app/(dashboard)/settings/chat/history.tsx`

### Tests
- `src/components/shell/__tests__/FloatingChatButton.test.tsx` (new)
- `src/app/(dashboard)/__tests__/chatRouteParity.test.ts` (new)

## Acceptance Criteria

- A floating chat action button is visible in the lower-right across all screens rendered in `DashboardShell`.
- On mobile, the FAB sits above the bottom tab bar; on larger breakpoints it sits with consistent bottom/right spacing.
- FAB is hidden on all chat routes because the user is already inside chat.
- Pressing FAB from each tab routes to that tab’s chat home (`/dashboard/chat`, `/agents/chat`, `/costs/chat`, `/governance/chat`, `/settings/chat`).
- Each tab stack has functioning chat routes for home, thread by `chatId`, and history.
- On `chat/[chatId]`, bottom tab bar is hidden and a keyboard-sliding composer is visible.
- Chat screens use shared contracts/hooks/services and do not call stubs directly from route files/screens.
- Stub API returns typed, realistic sample chat data with loading simulation.
- Route helper tests and new chat/FAB tests pass.
- TypeScript compiles with strict typing and no new `any` usage.

## Test Plan (Write + Run)

1. Route helper coverage:
- Extend `src/constants/__tests__/routes.test.ts` for:
  - chat home route generation per tab
  - chat history route generation per tab
  - chat thread route generation + URL encoding

2. FAB behavior tests:
- Add `src/components/shell/__tests__/FloatingChatButton.test.tsx` to assert:
  - pathname `/` routes to `/dashboard/chat`
  - pathname `/agents` routes to `/agents/chat`
  - pathname `/settings/chat/thread-1` routes to `/settings/chat`

3. Chat route parity tests:
- Add `src/app/(dashboard)/__tests__/chatRouteParity.test.ts` to assert wrappers are reused across all tab stacks for:
  - chat home
  - chat history
  - chat thread

4. Validation commands:
- `npx jest src/constants/__tests__/routes.test.ts`
- `npx jest src/components/shell/__tests__/FloatingChatButton.test.tsx`
- `npx jest --runTestsByPath 'src/app/(dashboard)/__tests__/chatRouteParity.test.ts'`
- `npx tsc --noEmit`

## Depends On

- **PR 0012** — App Shell, Navigation & Responsive Layout
- **PR 0043** — Per-tab route-wrapper architecture
- **PR 0078** — Home route parity and route activity behavior
