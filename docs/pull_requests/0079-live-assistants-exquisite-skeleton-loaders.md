# 0079 — Live Assistants Exquisite Skeleton Loaders

> Replace plain Live Assistants loading placeholders with polished, card-shaped skeletons that feel alive, while preserving accessibility and motion preferences.

---

## User Stories

1. As an admin user, I want the Live Assistants section to look intentional while data loads so the dashboard feels responsive and premium.
2. As a motion-sensitive user, I want loading placeholders to respect reduced-motion preferences so the UI remains comfortable.
3. As an engineer, I want loading UI encapsulated in a reusable component so the behavior is easy to maintain and test.

## Prior State

- `LiveAssistantsSection` showed plain rectangular placeholder cards with no content structure.
- Loading UI did not mirror the final card anatomy (avatar/title/task/meta/progress).
- No focused tests existed for Live Assistants loading vs empty/error/rendered states.

## Target State

1. Dedicated skeleton component:
- Add a new `LiveAssistantsSkeleton` component in `src/components/dashboard`.
- Render realistic placeholder cards that match Live Assistant card structure.

2. Visual polish ("jazz it up"):
- Add layered visual treatment (soft accent glow + shimmer sweep + pulse).
- Keep styling aligned with app theme tokens and semantic theme colors.
- Use subtle staggering across cards to avoid robotic repetition.

3. Accessibility/motion:
- Respect `useReducedMotion` and disable sweep/pulse loops when reduced motion is enabled.
- Keep static skeleton appearance clear and legible in both dark and light themes.

4. Section integration:
- Replace plain placeholder blocks in `LiveAssistantsSection` with the new skeleton component.
- Preserve existing behavior precedence for error, loading, empty, and populated states.

5. Guardrails:
- No API/service contract changes.
- No backend changes (stubbed data only remains unchanged).
- TypeScript strictness preserved.

## Files Created

- `docs/pull_requests/0079-live-assistants-exquisite-skeleton-loaders.md`
- `src/components/dashboard/LiveAssistantsSkeleton.tsx`
- `src/components/dashboard/__tests__/LiveAssistantsSection.test.tsx`

## Files Updated

- `docs/pull_requests/0000-task-manager.md`
- `src/components/dashboard/LiveAssistantsSection.tsx`
- `src/components/dashboard/index.ts`

## Acceptance Criteria

- While Live Assistants data is loading and no cards are yet available, the section shows polished skeleton cards (not plain blank blocks).
- Skeleton cards visually mirror final card layout: avatar/title/project/progress/task/meta regions.
- Skeleton visuals render appropriately in both themes and use semantic colors/tokens.
- Reduced-motion mode disables animated shimmer/pulse loops while preserving a static skeleton state.
- Error state still takes precedence over loading skeleton.
- Empty state still appears when loading is false and there are zero sessions.
- Existing live session cards still render and remain pressable when data is available.

## Test Plan (Write + Run)

1. Add component behavior tests:
- `src/components/dashboard/__tests__/LiveAssistantsSection.test.tsx`
- Validate:
  - loading + no sessions => skeleton visible
  - non-loading + no sessions => empty state visible
  - error present => error state visible
  - sessions present => live cards render

2. Focused validation commands:
- `npx jest src/components/dashboard/__tests__/LiveAssistantsSection.test.tsx`
- `npx tsc --noEmit`

## Depends On

- **PR 0024** — Motion, Animation & Micro-interactions
- **PR 0029** — Live Agents
