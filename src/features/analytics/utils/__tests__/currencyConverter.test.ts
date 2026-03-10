import { convertFromEUR, convertBetween } from "../currencyConverter";
import { CONVERSION_RATES } from "@/constants/currencies";

describe("convertFromEUR", () => {
  it("EUR → EUR returns the same amount", () => {
    expect(convertFromEUR(100, "EUR")).toBe(100);
  });

  it("EUR → USD uses the USD rate", () => {
    expect(convertFromEUR(100, "USD")).toBeCloseTo(100 * CONVERSION_RATES.USD);
  });

  it("EUR → JPY uses the JPY rate", () => {
    expect(convertFromEUR(100, "JPY")).toBeCloseTo(100 * CONVERSION_RATES.JPY);
  });

  it("zero amount stays zero", () => {
    expect(convertFromEUR(0, "USD")).toBe(0);
  });

  it("handles very large amounts", () => {
    expect(convertFromEUR(1_000_000_000, "USD")).toBeCloseTo(1_000_000_000 * CONVERSION_RATES.USD);
  });

  it("handles very small amounts", () => {
    expect(convertFromEUR(0.0001, "GBP")).toBeCloseTo(0.0001 * CONVERSION_RATES.GBP);
  });
});

describe("convertBetween", () => {
  it("same currency returns the same amount", () => {
    expect(convertBetween(100, "USD", "USD")).toBe(100);
  });

  it("USD → GBP produces correct cross-rate", () => {
    const expected = (100 / CONVERSION_RATES.USD) * CONVERSION_RATES.GBP;
    expect(convertBetween(100, "USD", "GBP")).toBeCloseTo(expected);
  });

  it("JPY → EUR divides by JPY rate", () => {
    const expected = 10000 / CONVERSION_RATES.JPY;
    expect(convertBetween(10000, "JPY", "EUR")).toBeCloseTo(expected);
  });

  it("round-trip conversion is approximately identity", () => {
    const converted = convertBetween(100, "USD", "GBP");
    const back = convertBetween(converted, "GBP", "USD");
    expect(back).toBeCloseTo(100);
  });

  it("zero amount stays zero", () => {
    expect(convertBetween(0, "USD", "GBP")).toBe(0);
  });
});
