# 0068 — Language Selection Modal, Form, and Multi-Language Translation Files

> Create `LanguageSelectionModal` and `LanguageSelectionForm` components, add translation JSON files for Russian, German, French, and Italian, and integrate language selection into the Settings screen.

---

## User Stories

1. As a user, I want to open a Language Selection modal from the Settings screen so I can choose my preferred language.
2. As a user, I want to see each language option displayed with its native name (e.g., "Deutsch" for German) so I can easily identify my language.
3. As a user, I want the app to immediately switch to my selected language so I can confirm the change took effect.
4. As a developer, I want all 5 language JSON files to follow the same namespace structure as the English catalogue so translations are consistent and complete.

## Prior State

- No language selection UI exists.
- Only `en.json` catalogue exists (from PR 0067).
- `ModalName` enum does not include a language selection entry.
- Settings screen has no language preference row.

## Target State

1. **LanguageSelectionModal** (`src/features/analytics/components/LanguageSelectionModal.tsx`):
   - Follows existing modal pattern: `React.memo`, `useAppSelector(selectModalVisible(...))`, overlay + panel.
   - Renders `LanguageSelectionForm` inside the modal panel.
   - Dispatches `closeModal` on dismiss.

2. **LanguageSelectionForm** (`src/features/analytics/components/LanguageSelectionForm.tsx`):
   - Displays a list of 5 language options with radio-style selection:
     - English (English)
     - Russian (Русский)
     - German (Deutsch)
     - French (Fran&ccedil;ais)
     - Italian (Italiano)
   - Highlights the currently selected language.
   - On selection: dispatches `setLanguage(code)` to Redux, calls `i18n.changeLanguage(code)`, and closes the modal.

3. **Translation Files** (`src/i18n/locales/`):
   - `ru.json` — Russian translations for all namespaces.
   - `de.json` — German translations for all namespaces.
   - `fr.json` — French translations for all namespaces.
   - `it.json` — Italian translations for all namespaces.
   - All files mirror the exact key structure of `en.json`.

4. **Modal Integration**:
   - Add `LanguageSelection` to `ModalName` enum in `modalSlice.ts`.
   - Mount `LanguageSelectionModal` in the modal layer (same location as other modals).

5. **Settings Screen Integration**:
   - Add a "Language" preference row in the Preferences section.
   - Row displays current language name and a chevron/arrow indicating it opens a modal.
   - Pressing the row dispatches `openModal(ModalName.LanguageSelection)`.

## Files to Create / Update

### New Files

- `src/features/analytics/components/LanguageSelectionModal.tsx`
- `src/features/analytics/components/LanguageSelectionForm.tsx`
- `src/i18n/locales/ru.json`
- `src/i18n/locales/de.json`
- `src/i18n/locales/fr.json`
- `src/i18n/locales/it.json`

### Updated Files

- `src/store/slices/modalSlice.ts` — Add `LanguageSelection` to `ModalName`
- `src/app/(dashboard)/settings/index.tsx` — Add language preference row
- `src/i18n/config.ts` — Register all 5 language resources
- Modal layer component — Mount `LanguageSelectionModal`

## Acceptance Criteria

- `LanguageSelectionModal` opens when the user taps the Language row in Settings.
- Modal displays all 5 languages with their native names.
- Current language is visually highlighted in the selection list.
- Selecting a language updates Redux state via `setLanguage`.
- Selecting a language calls `i18n.changeLanguage` so translations update immediately.
- Modal closes after selection.
- Settings Language row displays the name of the currently selected language.
- All 4 non-English JSON files (`ru.json`, `de.json`, `fr.json`, `it.json`) contain translations for every key in `en.json`.
- Switching to any language renders translated strings throughout the app (for components already using `t()`).
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Create `src/features/analytics/components/__tests__/LanguageSelectionModal.test.tsx`:
   - Modal renders when visible state is true.
   - Modal does not render when visible state is false.
   - All 5 language options are displayed.
   - Current language is visually indicated.
   - Pressing a language option dispatches `setLanguage` with the correct code.
   - Modal closes after language selection.

2. Create `src/features/analytics/components/__tests__/LanguageSelectionForm.test.tsx`:
   - All language options render with correct native labels.
   - Selected language has active/highlighted styling.
   - Pressing a different language fires the selection callback.

3. Update `src/app/(dashboard)/__tests__/settingsScreen.test.tsx`:
   - Language row renders with current language name.
   - Pressing Language row dispatches `openModal(ModalName.LanguageSelection)`.

4. Create `src/i18n/__tests__/translations.test.ts`:
   - All language files have the same set of top-level namespace keys as `en.json`.
   - No language file is missing keys that exist in `en.json` (completeness check).

5. Run validation:
   - `npx jest src/features/analytics/components/__tests__/LanguageSelectionModal.test.tsx`
   - `npx jest src/features/analytics/components/__tests__/LanguageSelectionForm.test.tsx`
   - `npx jest src/app/(dashboard)/__tests__/settingsScreen.test.tsx`
   - `npx jest src/i18n/__tests__/translations.test.ts`
   - `npx tsc --noEmit`

## Depends On

- **PR 0067** — Settings Preferences Slice + i18n Infrastructure
- **PR 0060** — Settings Screen Visual Refresh
