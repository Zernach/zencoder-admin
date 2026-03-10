import { renderHook, act } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  settingsSlice,
  setLanguage,
  setCurrency,
  selectSelectedLanguage,
  selectSelectedCurrency,
} from "@/store/slices/settingsSlice";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import i18n from "@/i18n/config";
import type { CurrencyCode, LanguageCode } from "@/types/settings";

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

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("Preferences Interaction — Cross-Feature Tests", () => {
  describe("language change affects i18n output", () => {
    it("switching i18n language changes translated strings for modal labels", async () => {
      const enSettings = i18n.t("settings.selectCurrency");
      expect(enSettings).toBe("Select currency");

      await i18n.changeLanguage("de");
      const deSettings = i18n.t("settings.selectCurrency");
      expect(deSettings).not.toBe("Select currency");
      expect(deSettings.length).toBeGreaterThan(0);
    });

    it("switching i18n language changes search currency placeholder", async () => {
      const enPlaceholder = i18n.t("settings.searchCurrency");
      expect(enPlaceholder).toBe("Search currencies...");

      await i18n.changeLanguage("fr");
      const frPlaceholder = i18n.t("settings.searchCurrency");
      expect(frPlaceholder).not.toBe("Search currencies...");
      expect(frPlaceholder.length).toBeGreaterThan(0);
    });
  });

  describe("currency change + language change produce correctly formatted and translated displays", () => {
    it("changing both currency and language produces correct output independently", async () => {
      const store = createSettingsStore();
      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });

      // Initial: EUR + English
      expect(result.current.formatCurrency(100)).toBe("€100.00");
      expect(i18n.t("common.cost")).toBe("Cost");

      // Change currency to JPY
      act(() => {
        store.dispatch(setCurrency("JPY"));
      });
      expect(result.current.formatCurrency(100)).toContain("¥");

      // Change language to Russian
      await i18n.changeLanguage("ru");
      expect(i18n.t("common.cost")).not.toBe("Cost");

      // Currency is still JPY — unchanged by language switch
      expect(result.current.currencyCode).toBe("JPY");
      expect(result.current.formatCurrency(100)).toContain("¥");
    });
  });

  describe("Redux state for language and currency are independent", () => {
    it("changing language does not affect currency", () => {
      const store = createSettingsStore();

      expect(selectSelectedCurrency(store.getState())).toBe("EUR");
      expect(selectSelectedLanguage(store.getState())).toBe("en");

      store.dispatch(setLanguage("fr"));

      expect(selectSelectedLanguage(store.getState())).toBe("fr");
      expect(selectSelectedCurrency(store.getState())).toBe("EUR");
    });

    it("changing currency does not affect language", () => {
      const store = createSettingsStore();

      store.dispatch(setCurrency("GBP"));

      expect(selectSelectedCurrency(store.getState())).toBe("GBP");
      expect(selectSelectedLanguage(store.getState())).toBe("en");
    });

    it("both can be changed independently", () => {
      const store = createSettingsStore();

      store.dispatch(setLanguage("it"));
      store.dispatch(setCurrency("KRW"));

      expect(selectSelectedLanguage(store.getState())).toBe("it");
      expect(selectSelectedCurrency(store.getState())).toBe("KRW");

      store.dispatch(setLanguage("de"));
      expect(selectSelectedLanguage(store.getState())).toBe("de");
      expect(selectSelectedCurrency(store.getState())).toBe("KRW");

      store.dispatch(setCurrency("BRL"));
      expect(selectSelectedLanguage(store.getState())).toBe("de");
      expect(selectSelectedCurrency(store.getState())).toBe("BRL");
    });
  });

  describe("edge cases", () => {
    it("rapid language switches do not produce stale state", async () => {
      const store = createSettingsStore();
      const languages: LanguageCode[] = ["en", "ru", "de", "fr", "it", "en"];

      for (const lang of languages) {
        store.dispatch(setLanguage(lang));
        await i18n.changeLanguage(lang);
      }

      expect(selectSelectedLanguage(store.getState())).toBe("en");
      expect(i18n.language).toBe("en");
      expect(i18n.t("common.appName")).toBe("Zencoder");
    });

    it("rapid currency switches do not produce stale state", () => {
      const store = createSettingsStore();
      const currencies: CurrencyCode[] = ["USD", "JPY", "GBP", "KRW", "BRL", "EUR"];

      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });

      for (const code of currencies) {
        act(() => {
          store.dispatch(setCurrency(code));
        });
      }

      expect(result.current.currencyCode).toBe("EUR");
      expect(result.current.formatCurrency(100)).toBe("€100.00");
    });

    it("rapid combined switches settle to correct final state", async () => {
      const store = createSettingsStore();
      const { result } = renderHook(() => useCurrencyFormatter(), {
        wrapper: createWrapper(store),
      });

      // Rapid alternation
      act(() => { store.dispatch(setCurrency("USD")); });
      store.dispatch(setLanguage("ru"));
      await i18n.changeLanguage("ru");
      act(() => { store.dispatch(setCurrency("JPY")); });
      store.dispatch(setLanguage("de"));
      await i18n.changeLanguage("de");
      act(() => { store.dispatch(setCurrency("GBP")); });
      store.dispatch(setLanguage("en"));
      await i18n.changeLanguage("en");

      expect(result.current.currencyCode).toBe("GBP");
      expect(result.current.currencySymbol).toBe("£");
      expect(selectSelectedLanguage(store.getState())).toBe("en");
      expect(i18n.t("common.appName")).toBe("Zencoder");
    });
  });
});
