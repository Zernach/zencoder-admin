import { configureStore } from "@reduxjs/toolkit";
import {
  settingsSlice,
  setLanguage,
  setCurrency,
  setDeviceDefaultLanguage,
  selectSelectedLanguage,
  selectDeviceDefaultLanguage,
  selectSelectedCurrency,
} from "../settingsSlice";

function createTestStore() {
  return configureStore({
    reducer: { settings: settingsSlice.reducer },
  });
}

describe("settingsSlice", () => {
  it("has correct initial state", () => {
    const store = createTestStore();
    const state = store.getState();
    expect(state.settings.selectedLanguage).toBe("en");
    expect(state.settings.deviceDefaultLanguage).toBe("en");
    expect(state.settings.selectedCurrency).toBe("EUR");
  });

  it("setLanguage updates selectedLanguage", () => {
    const store = createTestStore();
    store.dispatch(setLanguage("fr"));
    expect(store.getState().settings.selectedLanguage).toBe("fr");
  });

  it("setCurrency updates selectedCurrency", () => {
    const store = createTestStore();
    store.dispatch(setCurrency("USD"));
    expect(store.getState().settings.selectedCurrency).toBe("USD");
  });

  it("setDeviceDefaultLanguage updates deviceDefaultLanguage", () => {
    const store = createTestStore();
    store.dispatch(setDeviceDefaultLanguage("de"));
    expect(store.getState().settings.deviceDefaultLanguage).toBe("de");
  });

  it("selectSelectedLanguage returns correct value", () => {
    const store = createTestStore();
    store.dispatch(setLanguage("it"));
    expect(selectSelectedLanguage(store.getState())).toBe("it");
  });

  it("selectDeviceDefaultLanguage returns correct value", () => {
    const store = createTestStore();
    store.dispatch(setDeviceDefaultLanguage("ru"));
    expect(selectDeviceDefaultLanguage(store.getState())).toBe("ru");
  });

  it("selectSelectedCurrency returns correct value", () => {
    const store = createTestStore();
    store.dispatch(setCurrency("GBP"));
    expect(selectSelectedCurrency(store.getState())).toBe("GBP");
  });
});
