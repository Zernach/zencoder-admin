# 0078 — Home Route Dashboard Parity (No Redirect)

> Render the Home dashboard directly at `/` (no redirect) and keep `/dashboard` as an explicit alias that renders the exact same view.

---

## User Stories

1. As an admin user, I want `/` to render the Home dashboard immediately so I can land on the app without a redirect hop.
2. As a user with existing links/bookmarks, I want `/dashboard` to keep working and show the same Home dashboard view as `/`.
3. As an engineer, I want both routes to share one screen implementation so behavior stays consistent and maintainable.

## Prior State

- `src/app/index.tsx` used `<Redirect href={ROUTES.DASHBOARD} />`.
- `/dashboard` rendered the Home dashboard screen.
- `/` did not directly render the dashboard view.

## Target State

1. Root route rendering:
- `/` renders the Home dashboard screen directly.
- Root route no longer uses redirect behavior.

2. Dashboard route parity:
- `/dashboard` renders the same screen component as `/`.
- No duplicate dashboard screen implementations.

3. Navigation active-state behavior:
- Home navigation is considered active on both `/` and `/dashboard`.
- Pressing Home in sidebar or bottom tabs navigates to `/` (not `/dashboard`).

4. Guardrails:
- No API/service/type contract changes.
- No backend integration changes.
- TypeScript strictness remains intact.

## Files Created

- `docs/pull_requests/0078-home-route-dashboard-parity.md`
- `src/app/(dashboard)/index.tsx`
- `src/app/(dashboard)/__tests__/homeRouteParity.test.ts`

## Files Updated

- `docs/pull_requests/0000-task-manager.md`
- `src/app/index.tsx` (removed redirect route file)
- `src/constants/routes.ts`
- `src/constants/__tests__/routes.test.ts`

## Acceptance Criteria

- Navigating to `/` renders the Home admin dashboard view directly (no redirect component/path bounce).
- Navigating to `/dashboard` renders the exact same dashboard view as `/`.
- Home nav state is active when pathname is either `/` or `/dashboard`.
- Pressing Home from sidebar/bottom tabs always navigates to `/`.
- Existing non-home routes (`/agents`, `/costs`, `/governance`, `/settings`) continue unchanged.
- TypeScript compiles with no new `any`.

## Test Plan (Write + Run)

1. Add route parity test:
- `src/app/(dashboard)/__tests__/homeRouteParity.test.ts`
- Assert the `/` route and `/dashboard` route export the same screen component reference.

2. Extend route helper tests:
- `src/constants/__tests__/routes.test.ts`
- Add assertions that:
  - `isRouteActive("/", ROUTES.DASHBOARD)` is `true`
  - `isRouteActive("/", ROUTES.AGENTS)` is `false`

3. Focused validation commands:
- `npx jest src/app/(dashboard)/__tests__/homeRouteParity.test.ts`
- `npx jest src/constants/__tests__/routes.test.ts`
- `npx tsc --noEmit`

## Depends On

- **PR 0012** — App Shell, Navigation & Responsive Layout
- **PR 0036** — Home Navigation foundations
- **PR 0041** — Route contracts and path/tab helpers
