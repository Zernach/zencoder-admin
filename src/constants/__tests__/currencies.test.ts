import { CONVERSION_RATES, getCurrencySymbol, getCurrencyDecimals } from "../currencies";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/types/settings";

describe("CURRENCY_OPTIONS", () => {
  it("contains exactly 20 currencies", () => {
    expect(CURRENCY_OPTIONS).toHaveLength(20);
  });

  it("every option has code, symbol, name, and decimals", () => {
    for (const opt of CURRENCY_OPTIONS) {
      expect(opt.code).toBeTruthy();
      expect(opt.symbol).toBeTruthy();
      expect(opt.name).toBeTruthy();
      expect(typeof opt.decimals).toBe("number");
    }
  });

  it("has no duplicate codes", () => {
    const codes = CURRENCY_OPTIONS.map((o) => o.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("CONVERSION_RATES", () => {
  it("has a rate for every currency in CURRENCY_OPTIONS", () => {
    for (const opt of CURRENCY_OPTIONS) {
      expect(CONVERSION_RATES[opt.code]).toBeDefined();
      expect(typeof CONVERSION_RATES[opt.code]).toBe("number");
    }
  });

  it("EUR rate is exactly 1.0", () => {
    expect(CONVERSION_RATES.EUR).toBe(1.0);
  });

  it("all rates are positive", () => {
    for (const [, rate] of Object.entries(CONVERSION_RATES)) {
      expect(rate).toBeGreaterThan(0);
    }
  });
});

describe("getCurrencySymbol", () => {
  it.each<[CurrencyCode, string]>([
    ["USD", "$"],
    ["EUR", "€"],
    ["GBP", "£"],
    ["JPY", "¥"],
    ["KRW", "₩"],
    ["INR", "₹"],
    ["BRL", "R$"],
    ["CHF", "CHF"],
  ])("returns %s for %s", (code, expected) => {
    expect(getCurrencySymbol(code)).toBe(expected);
  });
});

describe("getCurrencyDecimals", () => {
  it("returns 0 for JPY", () => {
    expect(getCurrencyDecimals("JPY")).toBe(0);
  });

  it("returns 0 for KRW", () => {
    expect(getCurrencyDecimals("KRW")).toBe(0);
  });

  it("returns 2 for USD", () => {
    expect(getCurrencyDecimals("USD")).toBe(2);
  });

  it("returns 2 for EUR", () => {
    expect(getCurrencyDecimals("EUR")).toBe(2);
  });

  it("returns 2 for GBP", () => {
    expect(getCurrencyDecimals("GBP")).toBe(2);
  });
});
