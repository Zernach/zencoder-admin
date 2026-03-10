import { renderHook, act } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { settingsSlice, setCurrency } from "@/store/slices/settingsSlice";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { convertFromEUR } from "@/features/analytics/utils/currencyConverter";
import { formatCurrency, formatCompactCurrency, formatCostPerToken } from "@/features/analytics/utils/formatters";
import { CONVERSION_RATES, getCurrencySymbol, getCurrencyDecimals } from "@/constants/currencies";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/types/settings";

function createSettingsStore() {
  return configureStore({
    reducer: { settings: settingsSlice.reducer },
  });
}

function createWrapper(store: ReturnType<typeof createSettingsStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe("Currency Integration", () => {
  describe("switching currency updates all formatter outputs", () => {
    it("switching to USD updates formatCurrency, formatCompactCurrency, formatCostPerToken", () => {
      const store = createSettingsStore();
      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });

      // Default: EUR
      expect(result.current.formatCurrency(100)).toBe("€100.00");

      act(() => {
        store.dispatch(setCurrency("USD"));
      });

      // 100 EUR → 108 USD
      expect(result.current.formatCurrency(100)).toContain("$");
      expect(result.current.formatCurrency(100)).toBe("$108.00");
      expect(result.current.formatCompactCurrency(100)).toBe("$108.00");
      expect(result.current.formatCostPerToken(0.000001)).toContain("$");
    });
  });

  describe("spot-check conversions for 5 representative currencies", () => {
    const spotChecks: { code: CurrencyCode; rate: number; symbol: string; decimals: number }[] = [
      { code: "USD", rate: 1.08, symbol: "$", decimals: 2 },
      { code: "JPY", rate: 162.5, symbol: "¥", decimals: 0 },
      { code: "GBP", rate: 0.86, symbol: "£", decimals: 2 },
      { code: "KRW", rate: 1432.0, symbol: "₩", decimals: 0 },
      { code: "BRL", rate: 5.38, symbol: "R$", decimals: 2 },
    ];

    it.each(spotChecks)("$code: 100 EUR → correct converted amount", ({ code, rate, symbol, decimals }) => {
      const store = createSettingsStore();
      store.dispatch(setCurrency(code));
      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });

      const converted = 100 * rate;
      const formatted = result.current.formatCurrency(100);
      expect(formatted).toContain(symbol);

      if (decimals === 0) {
        expect(formatted).toBe(`${symbol}${Math.round(converted).toLocaleString("en-US")}`);
      } else {
        expect(formatted).toBe(
          `${symbol}${converted.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}`,
        );
      }
    });
  });

  describe("decimal places", () => {
    it("JPY displays 0 decimal places", () => {
      expect(formatCurrency(100, "JPY")).toBe("¥100");
      expect(formatCurrency(99.7, "JPY")).toBe("¥100");
    });

    it("KRW displays 0 decimal places", () => {
      expect(formatCurrency(1500, "KRW")).toBe("₩1,500");
    });

    it("USD displays 2 decimal places", () => {
      expect(formatCurrency(100, "USD")).toBe("$100.00");
    });

    it("GBP displays 2 decimal places", () => {
      expect(formatCurrency(100, "GBP")).toBe("£100.00");
    });

    it("BRL displays 2 decimal places", () => {
      expect(formatCurrency(100, "BRL")).toBe("R$100.00");
    });
  });

  describe("compact notation across currencies", () => {
    it("large amount in USD (millions)", () => {
      expect(formatCompactCurrency(2_500_000, "USD")).toBe("$2.5M");
    });

    it("large amount in JPY (millions)", () => {
      expect(formatCompactCurrency(5_000_000, "JPY")).toBe("¥5.0M");
    });

    it("large amount in KRW (millions)", () => {
      expect(formatCompactCurrency(1_200_000, "KRW")).toBe("₩1.2M");
    });

    it("thousands in GBP", () => {
      expect(formatCompactCurrency(45_000, "GBP")).toBe("£45.0K");
    });

    it("thousands in BRL", () => {
      expect(formatCompactCurrency(12_500, "BRL")).toBe("R$12.5K");
    });
  });

  describe("very small per-token costs across currencies", () => {
    it("USD per-token cost", () => {
      expect(formatCostPerToken(0.000031, "USD")).toBe("$31 micro-units/token");
    });

    it("EUR per-token cost", () => {
      expect(formatCostPerToken(0.000005, "EUR")).toBe("€5 micro-units/token");
    });

    it("JPY per-token cost", () => {
      expect(formatCostPerToken(0.0001, "JPY")).toBe("¥100 micro-units/token");
    });

    it("GBP per-token cost", () => {
      expect(formatCostPerToken(0.00002, "GBP")).toBe("£20 micro-units/token");
    });
  });

  describe("default currency (EUR) produces correct symbol and no conversion", () => {
    it("EUR rate is 1.0", () => {
      expect(CONVERSION_RATES.EUR).toBe(1.0);
    });

    it("convertFromEUR with EUR returns same amount", () => {
      expect(convertFromEUR(123.45, "EUR")).toBe(123.45);
    });

    it("EUR symbol is €", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("EUR has 2 decimals", () => {
      expect(getCurrencyDecimals("EUR")).toBe(2);
    });

    it("useCurrencyFormatter defaults to EUR", () => {
      const store = createSettingsStore();
      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });
      expect(result.current.currencyCode).toBe("EUR");
      expect(result.current.currencySymbol).toBe("€");
      expect(result.current.formatCurrency(50)).toBe("€50.00");
    });
  });

  describe("all 20 currencies exercised in formatting", () => {
    it.each(CURRENCY_OPTIONS.map((o) => o.code))("%s: formatCurrency produces non-empty output with correct symbol", (code) => {
      const symbol = getCurrencySymbol(code);
      const formatted = formatCurrency(100, code);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toContain(symbol);
    });
  });

  describe("edge cases", () => {
    describe("zero amounts across all 20 currencies", () => {
      it.each(CURRENCY_OPTIONS.map((o) => o.code))("%s: formatCurrency(0) produces valid output", (code) => {
        const formatted = formatCurrency(0, code);
        const symbol = getCurrencySymbol(code);
        const decimals = getCurrencyDecimals(code);
        if (decimals === 0) {
          expect(formatted).toBe(`${symbol}0`);
        } else {
          expect(formatted).toBe(`${symbol}0.00`);
        }
      });
    });

    describe("negative amounts", () => {
      it("negative amount in EUR", () => {
        expect(formatCurrency(-50, "EUR")).toBe("€-50.00");
      });

      it("negative amount in USD", () => {
        expect(formatCurrency(-100, "USD")).toBe("$-100.00");
      });

      it("negative amount in JPY (0 decimals)", () => {
        expect(formatCurrency(-1000, "JPY")).toBe("¥-1,000");
      });
    });
  });
});
