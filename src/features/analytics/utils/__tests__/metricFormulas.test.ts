import {
  calcSeatAdoptionRate,
  calcWauMauRatio,
  calcRunCompletionRate,
  calcRunSuccessRate,
  calcErrorRate,
  calcProviderShare,
  calcAverageTokensPerRun,
  calcAverageCostPerRunUsd,
  calcCostPerSuccessfulRunUsd,
  calcPrMergeRate,
  calcTestsPassRate,
  calcCodeAcceptanceRate,
  calcReworkRate,
  calcPolicyViolationRate,
} from "../metricFormulas";

// Helper: assert a value is a finite number (not NaN or Infinity)
function expectFiniteNumber(v: unknown) {
  expect(typeof v).toBe("number");
  expect(Number.isFinite(v)).toBe(true);
}

// ── Percentage functions ────────────────────────────────────────────

describe("calcSeatAdoptionRate", () => {
  it("normal case: 80/100 = 80", () => {
    expect(calcSeatAdoptionRate(80, 100)).toBe(80);
  });
  it("zero purchased: returns 0", () => {
    const result = calcSeatAdoptionRate(50, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("negative purchased: returns 0", () => {
    expect(calcSeatAdoptionRate(50, -10)).toBe(0);
  });
  it("full adoption: 100/100 = 100", () => {
    expect(calcSeatAdoptionRate(100, 100)).toBe(100);
  });
  it("over 100%: clamps to 100", () => {
    expect(calcSeatAdoptionRate(120, 100)).toBe(100);
  });
  it("returns a finite number", () => {
    expectFiniteNumber(calcSeatAdoptionRate(80, 100));
  });
});

describe("calcWauMauRatio", () => {
  it("normal: 60/100 = 60", () => {
    expect(calcWauMauRatio(60, 100)).toBe(60);
  });
  it("zero MAU: returns 0", () => {
    const result = calcWauMauRatio(30, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("equal WAU/MAU: 100", () => {
    expect(calcWauMauRatio(50, 50)).toBe(100);
  });
  it("clamps above 100", () => {
    expect(calcWauMauRatio(200, 100)).toBe(100);
  });
});

describe("calcRunCompletionRate", () => {
  it("normal: 90/100 = 90", () => {
    expect(calcRunCompletionRate(90, 100)).toBe(90);
  });
  it("zero started: returns 0", () => {
    const result = calcRunCompletionRate(50, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all completed: 100", () => {
    expect(calcRunCompletionRate(100, 100)).toBe(100);
  });
  it("clamps to [0,100]", () => {
    expect(calcRunCompletionRate(150, 100)).toBe(100);
  });
});

describe("calcRunSuccessRate", () => {
  it("normal: 72/100 = 72", () => {
    expect(calcRunSuccessRate(72, 100)).toBe(72);
  });
  it("zero completed: returns 0", () => {
    const result = calcRunSuccessRate(50, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all succeeded: 100", () => {
    expect(calcRunSuccessRate(100, 100)).toBe(100);
  });
});

describe("calcErrorRate", () => {
  it("normal: 18/100 = 18", () => {
    expect(calcErrorRate(18, 100)).toBe(18);
  });
  it("zero started: returns 0", () => {
    const result = calcErrorRate(18, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("none failed: 0", () => {
    expect(calcErrorRate(0, 100)).toBe(0);
  });
  it("clamps to 100", () => {
    expect(calcErrorRate(200, 100)).toBe(100);
  });
});

describe("calcProviderShare", () => {
  it("codex: 450/1000 = 45", () => {
    expect(calcProviderShare(450, 1000)).toBe(45);
  });
  it("zero runs: returns 0", () => {
    const result = calcProviderShare(450, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all one provider: 100", () => {
    expect(calcProviderShare(1000, 1000)).toBe(100);
  });
});

describe("calcAverageTokensPerRun", () => {
  it("normal: 100000/50 = 2000", () => {
    expect(calcAverageTokensPerRun(100000, 50)).toBe(2000);
  });
  it("zero runs: returns 0", () => {
    const result = calcAverageTokensPerRun(100000, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("rounds to nearest integer", () => {
    expect(calcAverageTokensPerRun(100, 3)).toBe(33);
  });
  it("returns a finite number", () => {
    expectFiniteNumber(calcAverageTokensPerRun(100000, 50));
  });
});

describe("calcAverageCostPerRunUsd", () => {
  it("normal: rounds to 2 decimals", () => {
    expect(calcAverageCostPerRunUsd(100, 3)).toBe(33.33);
  });
  it("zero runs: returns 0", () => {
    const result = calcAverageCostPerRunUsd(100, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("even division", () => {
    expect(calcAverageCostPerRunUsd(100, 4)).toBe(25);
  });
  it("returns a finite number", () => {
    expectFiniteNumber(calcAverageCostPerRunUsd(100, 3));
  });
});

describe("calcCostPerSuccessfulRunUsd", () => {
  it("normal: rounds to 2 decimals", () => {
    expect(calcCostPerSuccessfulRunUsd(100, 3)).toBe(33.33);
  });
  it("zero succeeded: returns 0", () => {
    const result = calcCostPerSuccessfulRunUsd(100, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("negative succeeded: returns 0", () => {
    expect(calcCostPerSuccessfulRunUsd(100, -5)).toBe(0);
  });
  it("even division", () => {
    expect(calcCostPerSuccessfulRunUsd(200, 4)).toBe(50);
  });
});

describe("calcPrMergeRate", () => {
  it("normal: 70/100 = 70", () => {
    expect(calcPrMergeRate(70, 100)).toBe(70);
  });
  it("zero created: returns 0", () => {
    const result = calcPrMergeRate(70, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all merged: 100", () => {
    expect(calcPrMergeRate(100, 100)).toBe(100);
  });
});

describe("calcTestsPassRate", () => {
  it("normal: 88/100 = 88", () => {
    expect(calcTestsPassRate(88, 100)).toBe(88);
  });
  it("zero executed: returns 0", () => {
    const result = calcTestsPassRate(88, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all passing: 100", () => {
    expect(calcTestsPassRate(100, 100)).toBe(100);
  });
});

describe("calcCodeAcceptanceRate", () => {
  it("normal case: 75/100 = 75", () => {
    expect(calcCodeAcceptanceRate(75, 100)).toBe(75);
  });
  it("zero suggestions: returns 0", () => {
    const result = calcCodeAcceptanceRate(75, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("all accepted: 100", () => {
    expect(calcCodeAcceptanceRate(100, 100)).toBe(100);
  });
  it("clamps over 100", () => {
    expect(calcCodeAcceptanceRate(120, 100)).toBe(100);
  });
});

describe("calcReworkRate", () => {
  it("normal case: 10/100 = 10", () => {
    expect(calcReworkRate(10, 100)).toBe(10);
  });
  it("zero succeeded: returns 0", () => {
    const result = calcReworkRate(10, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("no rework: 0", () => {
    expect(calcReworkRate(0, 100)).toBe(0);
  });
});

describe("calcPolicyViolationRate", () => {
  it("normal case: 5/100 = 5", () => {
    expect(calcPolicyViolationRate(5, 100)).toBe(5);
  });
  it("zero actions: returns 0", () => {
    const result = calcPolicyViolationRate(5, 0);
    expect(result).toBe(0);
    expectFiniteNumber(result);
  });
  it("no violations: 0", () => {
    expect(calcPolicyViolationRate(0, 1000)).toBe(0);
  });
  it("all violated: 100", () => {
    expect(calcPolicyViolationRate(100, 100)).toBe(100);
  });
});

// ── Cross-cutting: every function returns finite number for valid inputs ──

describe("cross-cutting: all functions return finite numbers", () => {
  const fns: Array<{ name: string; fn: (...args: number[]) => number; args: number[] }> = [
    { name: "calcSeatAdoptionRate", fn: calcSeatAdoptionRate, args: [80, 100] },
    { name: "calcWauMauRatio", fn: calcWauMauRatio, args: [60, 100] },
    { name: "calcRunCompletionRate", fn: calcRunCompletionRate, args: [90, 100] },
    { name: "calcRunSuccessRate", fn: calcRunSuccessRate, args: [72, 100] },
    { name: "calcErrorRate", fn: calcErrorRate, args: [18, 100] },
    { name: "calcProviderShare", fn: calcProviderShare, args: [450, 1000] },
    { name: "calcAverageTokensPerRun", fn: calcAverageTokensPerRun, args: [100000, 50] },
    { name: "calcAverageCostPerRunUsd", fn: calcAverageCostPerRunUsd, args: [100, 3] },
    { name: "calcCostPerSuccessfulRunUsd", fn: calcCostPerSuccessfulRunUsd, args: [100, 3] },
    { name: "calcPrMergeRate", fn: calcPrMergeRate, args: [70, 100] },
    { name: "calcTestsPassRate", fn: calcTestsPassRate, args: [88, 100] },
    { name: "calcCodeAcceptanceRate", fn: calcCodeAcceptanceRate, args: [75, 100] },
    { name: "calcReworkRate", fn: calcReworkRate, args: [10, 100] },
    { name: "calcPolicyViolationRate", fn: calcPolicyViolationRate, args: [5, 100] },
  ];

  for (const { name, fn, args } of fns) {
    it(`${name}: normal input is finite number`, () => {
      const result = fn(...args);
      expect(typeof result).toBe("number");
      expect(Number.isFinite(result)).toBe(true);
    });

    it(`${name}: zero denominator returns 0 (not NaN/Infinity)`, () => {
      const result = fn(args[0]!, 0);
      expect(result).toBe(0);
      expect(Number.isNaN(result)).toBe(false);
      expect(Number.isFinite(result)).toBe(true);
    });
  }
});

// ── Cross-cutting: percentage functions clamp to [0, 100] ──

describe("cross-cutting: percentage functions clamp to [0, 100]", () => {
  const percentFns: Array<{ name: string; fn: (a: number, b: number) => number }> = [
    { name: "calcSeatAdoptionRate", fn: calcSeatAdoptionRate },
    { name: "calcWauMauRatio", fn: calcWauMauRatio },
    { name: "calcRunCompletionRate", fn: calcRunCompletionRate },
    { name: "calcRunSuccessRate", fn: calcRunSuccessRate },
    { name: "calcErrorRate", fn: calcErrorRate },
    { name: "calcProviderShare", fn: calcProviderShare },
    { name: "calcPrMergeRate", fn: calcPrMergeRate },
    { name: "calcTestsPassRate", fn: calcTestsPassRate },
    { name: "calcCodeAcceptanceRate", fn: calcCodeAcceptanceRate },
    { name: "calcReworkRate", fn: calcReworkRate },
    { name: "calcPolicyViolationRate", fn: calcPolicyViolationRate },
  ];

  for (const { name, fn } of percentFns) {
    it(`${name}: result in [0, 100] for large numerator`, () => {
      const result = fn(500, 100);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it(`${name}: result in [0, 100] for zero numerator`, () => {
      const result = fn(0, 100);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  }
});

// ── Cross-cutting: currency functions round to 2 decimal places ──

describe("cross-cutting: currency functions round to 2 decimals", () => {
  const currencyFns: Array<{ name: string; fn: (a: number, b: number) => number }> = [
    { name: "calcAverageCostPerRunUsd", fn: calcAverageCostPerRunUsd },
    { name: "calcCostPerSuccessfulRunUsd", fn: calcCostPerSuccessfulRunUsd },
  ];

  for (const { name, fn } of currencyFns) {
    it(`${name}: result has at most 2 decimal places`, () => {
      const result = fn(100, 3); // 33.333... → 33.33
      const decimalStr = String(result).split(".")[1] || "";
      expect(decimalStr.length).toBeLessThanOrEqual(2);
    });

    it(`${name}: 100/7 rounds correctly`, () => {
      const result = fn(100, 7); // 14.2857... → 14.29
      expect(result).toBe(14.29);
    });
  }
});
