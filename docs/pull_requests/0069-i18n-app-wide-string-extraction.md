# 0069 — i18n App-Wide String Extraction and Translation Integration

> Replace all hardcoded English strings across every screen, component, and modal with `t()` translation calls so the entire app respects the user's selected language.

---

## User Stories

1. As a user who selected French, I want every piece of text in the app (navigation labels, screen titles, button text, table headers, tooltips, error messages) to appear in French.
2. As a developer, I want a consistent pattern for using translations so new features automatically follow the i18n convention.
3. As a QA tester, I want to verify that switching languages updates all visible text without requiring a page refresh or app restart.

## Prior State

- i18n infrastructure is configured (PR 0067) and all 5 language JSON files exist (PR 0068).
- Only components touched by PR 0068 use `t()` calls; the vast majority of the app still uses hardcoded English strings.

## Target State

1. **Every user-facing string** in the app is wrapped with `useTranslation()` + `t("namespace.key")`:
   - Navigation labels (sidebar items, tab names)
   - Screen titles and subtitles
   - Section headers and descriptions
   - Button labels and action text
   - Table column headers
   - Chart labels and legends
   - Modal titles, descriptions, and button text
   - Empty states, loading text, and error messages
   - Tooltip content
   - Form labels and placeholders
   - Search placeholder text

2. **Pattern**: Each component that renders text imports `useTranslation` from `react-i18next` and calls `const { t } = useTranslation()` at the top of the component.

3. **No behavioral changes**: This PR only swaps string literals for `t()` calls. No layout, logic, or styling changes.

## Files to Update

### Navigation & Shell
- `src/components/shell/Sidebar.tsx`
- `src/components/shell/TopBar.tsx`
- `src/components/shell/BottomTabBar.tsx` (if exists)

### Screens (all `src/app/(dashboard)/*/index.tsx`)
- `overview/index.tsx`
- `projects/index.tsx`
- `agents/index.tsx`
- `runs/index.tsx`
- `costs/index.tsx`
- `governance/index.tsx`
- `settings/index.tsx`

### Shared Components
- `src/components/tables/DataTable.tsx` — column headers
- `src/components/charts/*.tsx` — chart labels and legends
- `src/components/screen/ScreenWrapper.tsx`
- `src/components/search/SearchAutocomplete.tsx`
- `src/components/common/EmptyState.tsx` (if exists)
- `src/components/common/ErrorState.tsx` (if exists)

### Modals
- All modal components in `src/features/analytics/components/*Modal.tsx`
- All form components in `src/features/analytics/components/*Form.tsx`

### Entity Detail Screens
- All entity detail views and their section components

## Acceptance Criteria

- Zero hardcoded user-facing English strings remain in component render output (excluding developer-only strings like `testID` values and log messages).
- Every text string references a key that exists in all 5 language JSON files (`en.json`, `ru.json`, `de.json`, `fr.json`, `it.json`).
- Switching language in Settings immediately updates all visible text across the app without navigation or reload.
- No layout breakage from translated strings that are longer or shorter than English (spot-check German and Russian, which tend to be longer).
- Existing tests continue to pass (tests may need mock updates for `useTranslation`).
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Update existing screen tests to mock `react-i18next`:
   - Add a shared test utility `src/test-utils/i18nMock.ts` that provides a `useTranslation` mock returning `t(key) => key` (passthrough).
   - Apply mock to all screen and component test files.

2. Create `src/i18n/__tests__/stringCoverage.test.ts`:
   - Scan all 5 JSON files and assert every key in `en.json` exists in `ru.json`, `de.json`, `fr.json`, `it.json`.
   - Assert no empty-string values in any language file.

3. Run full test suite:
   - `npx jest --runInBand`
   - `npx tsc --noEmit`

4. Manual spot-check:
   - Switch to each language and verify: sidebar labels, screen titles, table headers, chart legends, modal text, settings text.

## Depends On

- **PR 0067** — Settings Preferences Slice + i18n Infrastructure
- **PR 0068** — Language Selection Modal and Multi-Language Files
