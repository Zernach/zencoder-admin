# 0071 — Currency Selection Modal and Form + Settings Integration

> Create `CurrencySelectionModal` and `CurrencySelectionForm` components with a searchable list of 20 currencies, and integrate currency selection into the Settings screen.

---

## User Stories

1. As a user, I want to open a Currency Selection modal from the Settings screen so I can choose my preferred currency for all monetary displays.
2. As a user, I want to search or scroll through 20 currency options so I can quickly find my preferred currency.
3. As a user, I want each currency option to show the currency symbol, code, and full name so I can make an informed choice.
4. As a user, I want the Settings screen to display my currently selected currency so I can see my preference at a glance.

## Prior State

- Currency conversion engine and formatter updates exist (PR 0070).
- `ModalName` enum does not include a currency selection entry.
- Settings screen has no currency preference row.

## Target State

1. **CurrencySelectionModal** (`src/features/analytics/components/CurrencySelectionModal.tsx`):
   - Follows existing modal pattern: `React.memo`, `useAppSelector(selectModalVisible(...))`, overlay + panel.
   - Renders `CurrencySelectionForm` inside the modal panel.
   - Dispatches `closeModal` on dismiss.
   - Slightly larger panel width (440px) to accommodate the longer list.

2. **CurrencySelectionForm** (`src/features/analytics/components/CurrencySelectionForm.tsx`):
   - Displays all 20 currencies from `CURRENCY_OPTIONS` in a scrollable list.
   - Each row shows: currency symbol, code (e.g., "USD"), and full name (e.g., "US Dollar").
   - Optional search/filter input at the top to narrow the list by code or name.
   - Currently selected currency is visually highlighted.
   - On selection: dispatches `setCurrency(code)` to Redux and closes the modal.
   - Currencies ordered by the list order defined in requirements (USD first through RUB last).

3. **Modal Integration**:
   - Add `CurrencySelection` to `ModalName` enum in `modalSlice.ts`.
   - Mount `CurrencySelectionModal` in the modal layer.

4. **Settings Screen Integration**:
   - Add a "Currency" preference row in the Preferences section (below Language row).
   - Row displays current currency symbol, code, and name (e.g., "&euro; EUR — Euro").
   - Pressing the row dispatches `openModal(ModalName.CurrencySelection)`.

## Files to Create / Update

### New Files

- `src/features/analytics/components/CurrencySelectionModal.tsx`
- `src/features/analytics/components/CurrencySelectionForm.tsx`

### Updated Files

- `src/store/slices/modalSlice.ts` — Add `CurrencySelection` to `ModalName`
- `src/app/(dashboard)/settings/index.tsx` — Add currency preference row
- Modal layer component — Mount `CurrencySelectionModal`

## Acceptance Criteria

- `CurrencySelectionModal` opens when the user taps the Currency row in Settings.
- Modal displays all 20 currencies with symbol, code, and full name.
- Current currency is visually highlighted in the selection list.
- Search/filter input narrows the list by currency code or name (e.g., typing "yen" shows only JPY).
- Selecting a currency updates Redux state via `setCurrency`.
- Modal closes after selection.
- Settings Currency row displays the symbol, code, and name of the currently selected currency.
- Default selection is EUR (Euro) for new users.
- Scrolling through all 20 currencies works smoothly on web, iOS, and Android.
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Create `src/features/analytics/components/__tests__/CurrencySelectionModal.test.tsx`:
   - Modal renders when visible state is true.
   - Modal does not render when visible state is false.
   - All 20 currency options are displayed.
   - Current currency is visually indicated.
   - Pressing a currency option dispatches `setCurrency` with the correct code.
   - Modal closes after currency selection.

2. Create `src/features/analytics/components/__tests__/CurrencySelectionForm.test.tsx`:
   - All 20 currencies render with correct symbol, code, and name.
   - Selected currency has active/highlighted styling.
   - Search input filters the list correctly (by code and by name).
   - Pressing a different currency fires the selection callback.

3. Update `src/app/(dashboard)/__tests__/settingsScreen.test.tsx`:
   - Currency row renders with current currency info.
   - Pressing Currency row dispatches `openModal(ModalName.CurrencySelection)`.

4. Run validation:
   - `npx jest src/features/analytics/components/__tests__/CurrencySelectionModal.test.tsx`
   - `npx jest src/features/analytics/components/__tests__/CurrencySelectionForm.test.tsx`
   - `npx jest src/app/(dashboard)/__tests__/settingsScreen.test.tsx`
   - `npx tsc --noEmit`

## Depends On

- **PR 0070** — Currency Conversion Engine and Redux State
- **PR 0060** — Settings Screen Visual Refresh
