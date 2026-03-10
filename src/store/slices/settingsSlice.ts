import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LanguageCode, CurrencyCode } from "@/types/settings";

export interface SettingsState {
  deviceDefaultLanguage: LanguageCode;
  selectedLanguage: LanguageCode;
  selectedCurrency: CurrencyCode;
}

const initialState: SettingsState = {
  deviceDefaultLanguage: "en",
  selectedLanguage: "en",
  selectedCurrency: "EUR",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.selectedLanguage = action.payload;
    },
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      state.selectedCurrency = action.payload;
    },
    setDeviceDefaultLanguage(state, action: PayloadAction<LanguageCode>) {
      state.deviceDefaultLanguage = action.payload;
    },
  },
});

export const { setLanguage, setCurrency, setDeviceDefaultLanguage } =
  settingsSlice.actions;

export const selectSelectedLanguage = (state: {
  settings: SettingsState;
}): LanguageCode => state.settings.selectedLanguage;

export const selectDeviceDefaultLanguage = (state: {
  settings: SettingsState;
}): LanguageCode => state.settings.deviceDefaultLanguage;

export const selectSelectedCurrency = (state: {
  settings: SettingsState;
}): CurrencyCode => state.settings.selectedCurrency;
