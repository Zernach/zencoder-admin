import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "./ThemeProvider";
import { AppDependenciesProvider } from "@/core/di";
import { store } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ReduxProvider store={store}>
          <AppDependenciesProvider>{children}</AppDependenciesProvider>
        </ReduxProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
