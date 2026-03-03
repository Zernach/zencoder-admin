import {
  formatCurrency,
  formatCostPerToken,
  formatPercent,
  formatNumber,
  formatCompactNumber,
  formatDuration,
  formatTokens,
  formatDelta,
} from "../formatters";

describe("formatCurrency", () => {
  it("zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
  it("normal", () => {
    expect(formatCurrency(47823)).toBe("$47,823.00");
  });
  it("with cents", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
  it("large", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });
  it("small decimal", () => {
    expect(formatCurrency(3.06)).toBe("$3.06");
  });
  it("negative value", () => {
    expect(formatCurrency(-50)).toBe("$-50.00");
  });
});

describe("formatCostPerToken", () => {
  it("formats in ten-thousandths of a cent per token", () => {
    expect(formatCostPerToken(0.123456)).toBe("123,456 ten-thousandths of a penny per token");
  });
  it("keeps small values visible", () => {
    expect(formatCostPerToken(0.000031)).toBe("31 ten-thousandths of a penny per token");
  });
});

describe("formatPercent", () => {
  it("zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
  it("normal", () => {
    expect(formatPercent(94.2)).toBe("94.2%");
  });
  it("100", () => {
    expect(formatPercent(100)).toBe("100.0%");
  });
  it("decimal rounding", () => {
    expect(formatPercent(33.33)).toBe("33.3%");
  });
});

describe("formatNumber", () => {
  it("zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
  it("normal", () => {
    expect(formatNumber(1247)).toBe("1,247");
  });
  it("million", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });
  it("rounds decimals", () => {
    expect(formatNumber(1247.6)).toBe("1,248");
  });
});

describe("formatCompactNumber", () => {
  it("small", () => {
    expect(formatCompactNumber(247)).toBe("247");
  });
  it("thousands", () => {
    expect(formatCompactNumber(15623)).toBe("15.6K");
  });
  it("millions", () => {
    expect(formatCompactNumber(2800000)).toBe("2.8M");
  });
  it("exact thousand", () => {
    expect(formatCompactNumber(1000)).toBe("1.0K");
  });
  it("zero", () => {
    expect(formatCompactNumber(0)).toBe("0");
  });
  it("just below 1000", () => {
    expect(formatCompactNumber(999)).toBe("999");
  });
});

describe("formatDuration", () => {
  it("sub-second", () => {
    expect(formatDuration(500)).toBe("0.5s");
  });
  it("seconds", () => {
    expect(formatDuration(2300)).toBe("2.3s");
  });
  it("long", () => {
    expect(formatDuration(120000)).toBe("120.0s");
  });
  it("zero", () => {
    expect(formatDuration(0)).toBe("0.0s");
  });
});

describe("formatTokens", () => {
  it("delegates to formatCompactNumber for small values", () => {
    expect(formatTokens(500)).toBe("500");
  });
  it("delegates to formatCompactNumber for thousands", () => {
    expect(formatTokens(15000)).toBe("15.0K");
  });
  it("delegates to formatCompactNumber for millions", () => {
    expect(formatTokens(2500000)).toBe("2.5M");
  });
});

describe("formatDelta", () => {
  it("positive", () => {
    expect(formatDelta(12.3)).toBe("+12.3%");
  });
  it("negative", () => {
    const result = formatDelta(-5.2);
    expect(result).toContain("5.2%");
    expect(result).not.toContain("+");
  });
  it("zero", () => {
    expect(formatDelta(0)).toBe("+0.0%");
  });
  it("uses minus sign (not hyphen) for negative", () => {
    const result = formatDelta(-3.0);
    expect(result).toBe("\u22123.0%");
  });
});
