# 0020 — Unit Tests: Metric Formulas & Formatters

> Write comprehensive unit tests for all 15 metric formula functions and all formatter utilities. Target: >=95% line coverage. Every zero-denominator, negative input, boundary, and rounding case covered.

---

## Prior State

`metricFormulas.ts` and `formatters.ts` exist (PR 0006) with 15 formula functions and 7 formatters. No tests exist.

## Target State

`npm test -- metricFormulas formatters` passes with >=95% line coverage and zero `NaN`/`Infinity` in any assertion.

---

## Files to Create

### `src/features/analytics/utils/__tests__/metricFormulas.test.ts`

Test every function with at minimum these cases:

```ts
describe("calcSeatAdoptionRate", () => {
  it("normal case: 80/100 = 80",       () => expect(calcSeatAdoptionRate(80, 100)).toBe(80));
  it("zero purchased: returns 0",       () => expect(calcSeatAdoptionRate(50, 0)).toBe(0));
  it("full adoption: 100/100 = 100",    () => expect(calcSeatAdoptionRate(100, 100)).toBe(100));
  it("over 100%: clamps to 100",        () => expect(calcSeatAdoptionRate(120, 100)).toBe(100));
});

describe("calcWauMauRatio", () => {
  it("normal: 60/100 = 60",             () => expect(calcWauMauRatio(60, 100)).toBe(60));
  it("zero MAU: returns 0",             () => expect(calcWauMauRatio(30, 0)).toBe(0));
  it("equal WAU/MAU: 100",              () => expect(calcWauMauRatio(50, 50)).toBe(100));
});

describe("calcRunCompletionRate", () => {
  it("normal: 90/100 = 90",             () => expect(calcRunCompletionRate(90, 100)).toBe(90));
  it("zero started: returns 0",          () => expect(calcRunCompletionRate(50, 0)).toBe(0));
  it("all completed: 100",               () => expect(calcRunCompletionRate(100, 100)).toBe(100));
});

describe("calcRunSuccessRate", () => {
  it("normal: 72/100 = 72",             () => ...);
  it("zero completed: returns 0",        () => ...);
  it("all succeeded: 100",               () => ...);
});

describe("calcErrorRate", () => {
  it("normal: 18/100 = 18",             () => ...);
  it("zero started: returns 0",          () => ...);
  it("none failed: 0",                   () => ...);
});

describe("calcProviderShare", () => {
  it("codex: 450/1000 = 45",            () => ...);
  it("zero runs: returns 0",             () => ...);
  it("all one provider: 100",            () => ...);
});

describe("calcAverageTokensPerRun", () => {
  it("normal: 100000/50 = 2000",        () => ...);
  it("zero runs: returns 0",             () => ...);
});

describe("calcAverageCostPerRunUsd", () => {
  it("normal: rounds to 2 decimals",    () => expect(calcAverageCostPerRunUsd(100, 3)).toBe(33.33));
  it("zero runs: returns 0",             () => ...);
});

describe("calcCostPerSuccessfulRunUsd", () => {
  it("normal: rounds to 2 decimals",    () => ...);
  it("zero succeeded: returns 0",        () => ...);
});

describe("calcPrMergeRate", () => {
  it("normal: 70/100 = 70",             () => ...);
  it("zero created: returns 0",          () => ...);
});

describe("calcTestsPassRate", () => {
  it("normal: 88/100 = 88",             () => ...);
  it("zero executed: returns 0",          () => ...);
});

describe("calcCodeAcceptanceRate", () => {
  it("normal case",                       () => ...);
  it("zero suggestions: returns 0",       () => ...);
});

describe("calcReworkRate", () => {
  it("normal case",                       () => ...);
  it("zero succeeded: returns 0",         () => ...);
});

describe("calcPolicyViolationRate", () => {
  it("normal case",                       () => ...);
  it("zero actions: returns 0",           () => ...);
});
```

**Cross-cutting assertions** (on every function):
- Zero denominator → exactly `0` (assert `!== NaN`, `!== Infinity`).
- Return type is `number`.
- Percentage functions: result ∈ [0, 100] for valid positive inputs.
- Currency functions: result rounded to 2 decimal places.

### `src/features/analytics/utils/__tests__/formatters.test.ts`

```ts
describe("formatCurrency", () => {
  it("zero",          () => expect(formatCurrency(0)).toBe("$0.00"));
  it("normal",        () => expect(formatCurrency(47823)).toBe("$47,823.00"));
  it("with cents",    () => expect(formatCurrency(1234.56)).toBe("$1,234.56"));
  it("large",         () => expect(formatCurrency(1000000)).toBe("$1,000,000.00"));
  it("small decimal", () => expect(formatCurrency(3.06)).toBe("$3.06"));
});

describe("formatPercent", () => {
  it("zero",    () => expect(formatPercent(0)).toBe("0.0%"));
  it("normal",  () => expect(formatPercent(94.2)).toBe("94.2%"));
  it("100",     () => expect(formatPercent(100)).toBe("100.0%"));
});

describe("formatNumber", () => {
  it("zero",    () => expect(formatNumber(0)).toBe("0"));
  it("normal",  () => expect(formatNumber(1247)).toBe("1,247"));
  it("million", () => expect(formatNumber(1000000)).toBe("1,000,000"));
});

describe("formatCompactNumber", () => {
  it("small",   () => expect(formatCompactNumber(247)).toBe("247"));
  it("thousands", () => expect(formatCompactNumber(15623)).toBe("15.6K"));
  it("millions", () => expect(formatCompactNumber(2800000)).toBe("2.8M"));
  it("billions", () => expect(formatCompactNumber(1500000000)).toBe("1.5B"));
});

describe("formatDuration", () => {
  it("sub-second",  () => expect(formatDuration(500)).toBe("0.5s"));
  it("seconds",     () => expect(formatDuration(2300)).toBe("2.3s"));
  it("long",        () => expect(formatDuration(120000)).toBe("120.0s"));
});

describe("formatDelta", () => {
  it("positive",  () => expect(formatDelta(12.3)).toBe("+12.3%"));
  it("negative",  () => expect(formatDelta(-5.2)).toContain("5.2%"));
  it("zero",      () => expect(formatDelta(0)).toBe("+0.0%"));
});
```

---

## Depends On

**PR 0006** — `metricFormulas.ts` and `formatters.ts` (code under test).

## Done When

- All 15 formula functions tested with >=3 cases each.
- Every function tested with zero-denominator returning `0`.
- No test assertion evaluates to `NaN` or `Infinity`.
- All formatter tests pass.
- `npm test -- --coverage` reports >=95% line coverage for both files.
- Zero skipped tests.
