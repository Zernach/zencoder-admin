# 0073 — Language and Currency Preferences: Full Test Coverage

> Comprehensive test suite covering the complete language and currency preference flows end-to-end, including settings interactions, modal workflows, app-wide effects, and edge cases.

---

## User Stories

1. As a developer, I want full test coverage for the language selection flow so regressions are caught immediately.
2. As a developer, I want full test coverage for the currency selection flow so conversion logic and display formatting are verified across all supported currencies.
3. As a QA engineer, I want integration tests that verify the complete settings-to-app-wide-effect pipeline for both language and currency preferences.

## Prior State

- Individual unit tests exist for the settings slice, i18n config, modals, forms, formatters, and currency converter (PRs 0067–0072).
- No integration tests verify the full user flow from Settings through to app-wide effects.
- No edge-case or cross-feature tests exist.

## Target State

1. **Settings Screen Integration Tests** (`src/app/(dashboard)/__tests__/settingsPreferences.test.tsx`):
   - Full flow: open Settings → tap Language row → modal opens → select language → modal closes → Settings row updates.
   - Full flow: open Settings → tap Currency row → modal opens → search → select currency → modal closes → Settings row updates.
   - Both preference rows show correct current values on initial render.
   - Regression: theme toggle, sign-out notice, and other existing settings still work after language/currency additions.

2. **Language Integration Tests** (`src/i18n/__tests__/languageIntegration.test.ts`):
   - Switching from English to each of the 4 other languages updates `t()` output.
   - Switching back to English restores original strings.
   - Device default language detection fallback (unknown locale falls back to English).
   - All 5 language files pass completeness check (no missing keys vs `en.json`).
   - No empty string values in any language file.

3. **Currency Integration Tests** (`src/features/analytics/__tests__/currencyIntegration.test.tsx`):
   - Switching currency updates all formatter outputs.
   - Spot-check conversions for 5 representative currencies: USD, JPY, GBP, KRW, BRL.
   - JPY and KRW display 0 decimal places; USD, GBP, BRL display 2.
   - Very large amounts format correctly with compact notation across currencies.
   - Very small per-token costs format correctly across currencies.
   - Default currency (EUR) produces correct symbol and no conversion (rate = 1.0).

4. **Cross-Feature Tests** (`src/features/analytics/__tests__/preferencesInteraction.test.tsx`):
   - Language change affects currency selection modal labels (modal text is translated).
   - Currency change + language change together produce correctly translated and converted displays.
   - Redux state for language and currency are independent (changing one doesn't affect the other).

5. **Edge Case Tests**:
   - Currency formatting with zero amounts across all 20 currencies.
   - Currency formatting with negative amounts (if applicable).
   - Language switch during an open modal does not crash.
   - Rapid language or currency switches do not produce stale UI.

## Files to Create / Update

### New Files

- `src/app/(dashboard)/__tests__/settingsPreferences.test.tsx`
- `src/i18n/__tests__/languageIntegration.test.ts`
- `src/features/analytics/__tests__/currencyIntegration.test.tsx`
- `src/features/analytics/__tests__/preferencesInteraction.test.tsx`

### Updated Files

- `src/app/(dashboard)/__tests__/settingsScreen.test.tsx` — Ensure no overlap with new test files; refactor shared setup if needed

## Acceptance Criteria

- All new test files pass: `npx jest --runInBand`.
- Test coverage for `settingsSlice` actions and selectors is 100%.
- Test coverage for `currencyConverter` functions is 100%.
- Test coverage for all 5 language JSON files' key completeness is 100%.
- All 20 currencies are exercised in at least one formatting test.
- Integration tests verify the Settings → Redux → App-wide display pipeline for both features.
- No existing tests are broken by this PR.
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Write all 4 new test files as specified above.

2. Run new tests in isolation:
   - `npx jest src/app/(dashboard)/__tests__/settingsPreferences.test.tsx`
   - `npx jest src/i18n/__tests__/languageIntegration.test.ts`
   - `npx jest src/features/analytics/__tests__/currencyIntegration.test.tsx`
   - `npx jest src/features/analytics/__tests__/preferencesInteraction.test.tsx`

3. Run full test suite to verify no regressions:
   - `npx jest --runInBand`

4. Type check:
   - `npx tsc --noEmit`

## Depends On

- **PR 0067** — Settings Preferences Slice + i18n Infrastructure
- **PR 0068** — Language Selection Modal and Translations
- **PR 0069** — i18n App-Wide String Extraction
- **PR 0070** — Currency Conversion Engine
- **PR 0071** — Currency Selection Modal
- **PR 0072** — Currency App-Wide Integration
