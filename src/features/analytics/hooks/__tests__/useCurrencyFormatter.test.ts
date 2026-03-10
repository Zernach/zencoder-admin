import { renderHook, act } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { settingsSlice, setCurrency } from "@/store/slices/settingsSlice";
import { useCurrencyFormatter } from "../useCurrencyFormatter";

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

describe("useCurrencyFormatter", () => {
  it("reads selectedCurrency from store (defaults to EUR)", () => {
    const store = createSettingsStore();
    const { result } = renderHook(() => useCurrencyFormatter(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.currencyCode).toBe("EUR");
    expect(result.current.currencySymbol).toBe("€");
  });

  it("formatCurrency formats in the store's selected currency", () => {
    const store = createSettingsStore();
    store.dispatch(setCurrency("USD"));

    const { result } = renderHook(() => useCurrencyFormatter(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.currencyCode).toBe("USD");
    // 100 EUR → 108 USD (rate 1.08)
    const formatted = result.current.formatCurrency(100);
    expect(formatted).toContain("$");
    expect(formatted).toContain("108.00");
  });

  it("formatCurrency returns EUR values when currency is EUR", () => {
    const store = createSettingsStore();
    const { result } = renderHook(() => useCurrencyFormatter(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.formatCurrency(100)).toBe("€100.00");
  });

  it("formatCompactCurrency works with selected currency", () => {
    const store = createSettingsStore();
    store.dispatch(setCurrency("JPY"));

    const { result } = renderHook(() => useCurrencyFormatter(), {
      wrapper: createWrapper(store),
    });

    // 1000 EUR → 162500 JPY
    const formatted = result.current.formatCompactCurrency(1000);
    expect(formatted).toContain("¥");
    expect(formatted).toContain("K");
  });

  it("updates when currency changes in store", () => {
    const store = createSettingsStore();
    const { result } = renderHook(() => useCurrencyFormatter(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.currencyCode).toBe("EUR");

    act(() => {
      store.dispatch(setCurrency("GBP"));
    });

    expect(result.current.currencyCode).toBe("GBP");
    expect(result.current.currencySymbol).toBe("£");
  });
});
