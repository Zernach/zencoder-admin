# 0067 — Settings Preferences Redux Slice + i18n Infrastructure

> Create a new `settingsSlice` for user preferences (language and currency) and set up the i18n infrastructure with `i18next` and `react-i18next`, including the English JSON catalogue of every text string in the app.

---

## User Stories

1. As a user, I want my language and currency preferences to be stored in a central Redux slice so they persist throughout my session and are accessible app-wide.
2. As a developer, I want a proper i18n infrastructure using `i18next` so all UI strings can be translated without changing component code.
3. As a developer, I want a single English JSON file cataloguing every user-facing text string in the app so it serves as the source of truth for all translations.

## Prior State

- No `settingsSlice` exists; theme toggle lives in `ThemeProvider` context, other settings are local `useState`.
- All text strings are hardcoded English throughout the codebase.
- No i18n library is installed or configured.
- Currency formatting in `src/features/analytics/utils/formatters.ts` is hardcoded to USD (`$`).

## Target State

1. **Settings Redux Slice** (`src/store/slices/settingsSlice.ts`):
   - `deviceDefaultLanguage: LanguageCode` — detected from device locale, fallback `"en"`.
   - `selectedLanguage: LanguageCode` — user-chosen language, default `"en"`.
   - `selectedCurrency: CurrencyCode` — user-chosen currency, default `"EUR"`.
   - Actions: `setLanguage(code)`, `setCurrency(code)`.
   - Typed selectors: `selectSelectedLanguage`, `selectDeviceDefaultLanguage`, `selectSelectedCurrency`.

2. **Language and Currency Types** (`src/types/settings.ts`):
   - `LanguageCode` union type: `"en" | "ru" | "de" | "fr" | "it"`.
   - `CurrencyCode` union type for all 20 supported currencies.
   - `LanguageOption` interface: `{ code: LanguageCode; label: string; nativeLabel: string }`.
   - `CurrencyOption` interface: `{ code: CurrencyCode; symbol: string; name: string }`.

3. **i18n Configuration** (`src/i18n/`):
   - Install and configure `i18next` + `react-i18next`.
   - `src/i18n/config.ts` — initializer with English as default, lazy-load other languages.
   - `src/i18n/locales/en.json` — complete English catalogue of every user-facing string in the app, organized by feature namespace (e.g., `settings.*`, `dashboard.*`, `navigation.*`, `agents.*`, `costs.*`, `governance.*`, `common.*`).

4. **Provider Integration**:
   - Import i18n config in `AppProviders.tsx` so translations are available app-wide.
   - Add `settingsSlice` reducer to store configuration.

## Files to Create / Update

### New Files

- `src/types/settings.ts` — Language and currency type definitions
- `src/store/slices/settingsSlice.ts` — Redux slice for preferences
- `src/i18n/config.ts` — i18next initialization and configuration
- `src/i18n/locales/en.json` — Complete English string catalogue
- `src/i18n/index.ts` — Barrel export

### Updated Files

- `src/store/store.ts` — Add `settings` reducer
- `src/providers/AppProviders.tsx` — Import `src/i18n/config.ts` for side-effect initialization

## Acceptance Criteria

- `settingsSlice` exists with `deviceDefaultLanguage`, `selectedLanguage`, and `selectedCurrency` fields.
- `setLanguage` and `setCurrency` actions correctly update state.
- Typed selectors (`selectSelectedLanguage`, `selectSelectedCurrency`, `selectDeviceDefaultLanguage`) are exported and work correctly.
- `i18next` is configured with English as the default and fallback language.
- `en.json` contains every user-facing string in the app, organized by namespace.
- Namespaces cover at minimum: `common`, `navigation`, `dashboard`, `projects`, `agents`, `runs`, `costs`, `governance`, `settings`, `search`, `modals`, `errors`.
- i18n is initialized in the provider stack so `useTranslation()` works in any component.
- Store configuration includes the new `settings` reducer without breaking existing slices.
- `npx tsc --noEmit` passes with no new errors.

## Test Plan (Write + Run)

1. Create `src/store/slices/__tests__/settingsSlice.test.ts`:
   - Initial state has `selectedLanguage: "en"`, `deviceDefaultLanguage: "en"`, `selectedCurrency: "EUR"`.
   - `setLanguage("fr")` updates `selectedLanguage` to `"fr"`.
   - `setCurrency("USD")` updates `selectedCurrency` to `"USD"`.
   - Selectors return correct values from store state.

2. Create `src/i18n/__tests__/config.test.ts`:
   - i18n initializes without errors.
   - English translations load and `t("common.appName")` returns expected string.
   - Fallback to English works for missing keys.

3. Run validation:
   - `npx jest src/store/slices/__tests__/settingsSlice.test.ts`
   - `npx jest src/i18n/__tests__/config.test.ts`
   - `npx tsc --noEmit`

## Depends On

- **PR 0055** — Redux Store Hardening
- **PR 0060** — Settings Screen Visual Refresh
