# 0070 — Currency Conversion Engine, Redux State, and Formatter Updates

> Add hard-coded currency conversion rates for 20 currencies to the settings Redux slice, create a currency-aware formatting engine, and update all monetary formatters to respect the user's selected currency.

---

## User Stories

1. As a user who works in Japanese Yen, I want all monetary values in the app to be displayed in JPY with the correct symbol and conversion so I can understand costs in my local currency.
2. As a developer, I want a single `useCurrencyFormatter` hook that returns currency-aware formatting functions so I don't have to manually apply conversions in every component.
3. As an engineer, I want hard-coded conversion rates stored in one place so they can be easily swapped for a live API later.

## Prior State

- `formatCurrency` in `src/features/analytics/utils/formatters.ts` is hardcoded to USD with `$` symbol.
- `settingsSlice` stores `selectedCurrency` (from PR 0067) but no conversion rates or currency metadata.
- No currency conversion logic exists anywhere in the codebase.

## Target State

1. **Currency Constants** (`src/constants/currencies.ts`):
   - `CURRENCY_OPTIONS: CurrencyOption[]` — all 20 currencies with code, symbol, name, and decimal places:
     - USD ($), EUR (&euro;), JPY (&yen;), GBP (&pound;), CNY (&yen;), CHF (CHF), AUD (A$), CAD (C$), HKD (HK$), SGD (S$), SEK (kr), NOK (kr), NZD (NZ$), MXN (MX$), INR (&8377;), KRW (&8361;), TRY (&8378;), BRL (R$), ZAR (R), RUB (&8381;)
   - `CONVERSION_RATES: Record<CurrencyCode, number>` — EUR-based conversion rates (EUR = 1.0, USD = 1.08, JPY = 162.5, etc.) with realistic approximate values.
   - `getCurrencySymbol(code: CurrencyCode): string`
   - `getCurrencyDecimals(code: CurrencyCode): number` — returns 0 for JPY/KRW, 2 for most others.

2. **Currency Conversion Utilities** (`src/features/analytics/utils/currencyConverter.ts`):
   - `convertFromEUR(amountEUR: number, targetCurrency: CurrencyCode): number`
   - `convertBetween(amount: number, from: CurrencyCode, to: CurrencyCode): number`
   - All seed data is assumed to be in EUR (the default currency).

3. **Updated Formatters** (`src/features/analytics/utils/formatters.ts`):
   - `formatCurrency(amount: number, currencyCode: CurrencyCode): string` — formats with correct symbol, decimal places, and thousand separators.
   - `formatCostPerToken(amountPerToken: number, currencyCode: CurrencyCode): string` — same currency awareness.
   - `formatCompactCurrency(amount: number, currencyCode: CurrencyCode): string` — compact format (e.g., "$1.2M", "&yen;162.5M").
   - Backward-compatible: if `currencyCode` is omitted, defaults to `"EUR"`.

4. **Currency Formatter Hook** (`src/features/analytics/hooks/useCurrencyFormatter.ts`):
   - Reads `selectSelectedCurrency` from Redux.
   - Returns `{ formatCurrency, formatCostPerToken, formatCompactCurrency, currencyCode, currencySymbol }` — all pre-bound to the selected currency.
   - Memoized to prevent unnecessary re-renders.

## Files to Create / Update

### New Files

- `src/constants/currencies.ts` — Currency options, conversion rates, helpers
- `src/features/analytics/utils/currencyConverter.ts` — Conversion functions
- `src/features/analytics/hooks/useCurrencyFormatter.ts` — Hook for currency-aware formatting

### Updated Files

- `src/features/analytics/utils/formatters.ts` — Add currency parameter to monetary formatters
- `src/types/settings.ts` — Ensure `CurrencyCode` and `CurrencyOption` types are complete with all 20 currencies

## Acceptance Criteria

- `CONVERSION_RATES` contains realistic EUR-based rates for all 20 currencies.
- `CURRENCY_OPTIONS` contains code, symbol, name, and decimal places for all 20 currencies.
- `convertFromEUR` correctly converts amounts using the rate table.
- `formatCurrency(100, "JPY")` returns "&yen;100" (no decimals for JPY).
- `formatCurrency(100, "USD")` returns "$100.00" (2 decimals for USD).
- `formatCurrency(100, "EUR")` returns "&euro;100.00".
- `useCurrencyFormatter` reads from Redux and returns pre-bound formatters.
- Existing calls to `formatCurrency` that don't pass a currency code still work (default EUR).
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Create `src/constants/__tests__/currencies.test.ts`:
   - All 20 currency codes are present in `CURRENCY_OPTIONS`.
   - All 20 currency codes have a conversion rate in `CONVERSION_RATES`.
   - EUR conversion rate is exactly 1.0.
   - `getCurrencySymbol` returns correct symbols for spot-checked currencies.
   - `getCurrencyDecimals` returns 0 for JPY and KRW, 2 for USD and EUR.

2. Create `src/features/analytics/utils/__tests__/currencyConverter.test.ts`:
   - `convertFromEUR(100, "EUR")` returns 100.
   - `convertFromEUR(100, "USD")` returns ~108 (based on rate).
   - `convertBetween(100, "USD", "GBP")` produces correct cross-rate result.
   - Edge cases: zero amount, very large amounts, very small amounts.

3. Update `src/features/analytics/utils/__tests__/formatters.test.ts`:
   - `formatCurrency` with explicit currency codes produces correct symbol and decimals.
   - `formatCurrency` without currency code defaults to EUR.
   - `formatCostPerToken` respects currency parameter.

4. Create `src/features/analytics/hooks/__tests__/useCurrencyFormatter.test.ts`:
   - Hook reads `selectedCurrency` from store.
   - Returned `formatCurrency` uses the store's selected currency.
   - Changing currency in store updates the hook's output.

5. Run validation:
   - `npx jest src/constants/__tests__/currencies.test.ts`
   - `npx jest src/features/analytics/utils/__tests__/currencyConverter.test.ts`
   - `npx jest src/features/analytics/utils/__tests__/formatters.test.ts`
   - `npx jest src/features/analytics/hooks/__tests__/useCurrencyFormatter.test.ts`
   - `npx tsc --noEmit`

## Depends On

- **PR 0067** — Settings Preferences Slice (provides `selectedCurrency` in Redux)
