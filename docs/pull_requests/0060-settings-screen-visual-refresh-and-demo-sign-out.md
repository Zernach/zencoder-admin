# 0060 — Settings: Visual Refresh + Demo Sign Out Notice

> Upgrade `/settings` from a basic utility layout to a polished, engaging screen, and add a sign-out action that clearly communicates sign-out is disabled in this demo dashboard.

---

## User Stories

1. As a dashboard user, I want the Settings screen to feel visually intentional and modern so it matches the quality of the rest of the product.
2. As a cross-platform user (web, iOS, Android), I want Settings sections to be easy to scan and interact with so I can quickly find preferences and org actions.
3. As a user looking for account actions, I want a Sign Out button with explicit demo messaging so I understand why sign-out is unavailable in this environment.

## Prior State

- `src/app/(dashboard)/settings/index.tsx` uses functional but plain card rows with limited visual hierarchy.
- The screen has no sign-out action.
- There is no dedicated Settings screen test file under `src/app/(dashboard)/__tests__`.

## Target State

Settings gets a visual polish pass plus a safe demo-only sign-out interaction:

1. Visual refresh:
- Add a stronger top-level hero/intro treatment for Settings (improved hierarchy, spacing, and visual emphasis).
- Restyle section cards (`Preferences`, `Organization`, `Danger Zone`) for clearer grouping and better scanability.
- Preserve current theme compatibility (light and dark) using semantic theme tokens.
- Keep responsive behavior intact across web/mobile breakpoints.

2. Demo sign-out behavior:
- Add a `Sign Out` button in the account/action area of the Settings screen.
- Pressing `Sign Out` does not navigate away and does not mutate auth state.
- Pressing `Sign Out` shows a user-facing message:
  - `This is a dashboard demo, so you are unable to sign out.`
- Message is dismissible and accessible on web/iOS/Android.

3. Regression guardrails:
- Existing interactions continue to work:
  - Theme mode toggle
  - Other setting toggles
  - Create Team modal open/close flow
  - Clear Cache button rendering

## Files to Create / Update

### `src/app/(dashboard)/settings/index.tsx`

- Apply visual redesign for Settings layout and cards.
- Add `Sign Out` action and demo-info message/modal state handling.
- Keep screen wrapped in existing `ScreenWrapper` and preserve current section structure.

### `src/app/(dashboard)/__tests__/settingsScreen.test.tsx` (new)

- Add screen-level tests for refreshed Settings behavior, including sign-out messaging.

## Acceptance Criteria

- `/settings` visually reflects an intentional refresh (hero emphasis + polished section card styling) instead of the previous plain layout.
- `Sign Out` button is visible and accessible (`accessibilityRole="button"` and descriptive label).
- Pressing `Sign Out` shows: `This is a dashboard demo, so you are unable to sign out.`
- Sign-out press does not trigger route navigation or authentication state changes.
- Demo sign-out message can be dismissed cleanly.
- Theme toggle and existing settings toggles still operate correctly.
- Create Team modal still opens and closes correctly after redesign.
- Screen remains usable and readable on web, iOS, and Android layouts.

## Test Plan (Write + Run)

1. Create `settingsScreen.test.tsx` and assert baseline render:
- Screen title/subtitle render.
- Primary sections render (`Preferences`, `Organization`, `Danger Zone`).
- `Sign Out` control is present.

2. Add sign-out behavior tests:
- Pressing `Sign Out` displays exact demo message text.
- Dismissing the message hides it.
- Confirm no navigation/auth side effects are invoked (mock navigation/auth and assert no calls).

3. Add regression tests for existing interactions:
- Theme toggle can still be changed.
- Non-theme toggles still update state.
- Create Team modal open/close remains functional.

4. Run focused validation:
- `npx jest 'src/app/(dashboard)/__tests__/settingsScreen.test.tsx'`
- `npx jest 'src/components/shell/__tests__/Sidebar.test.tsx'`
- `npx tsc --noEmit`

## Depends On

- **PR 0019** — Settings Screen baseline
- **PR 0009** — Core UI component patterns
- **PR 0002** — Theme tokens and provider support
