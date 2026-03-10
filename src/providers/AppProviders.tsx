import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "./ThemeProvider";
import { AppDependenciesProvider } from "@/core/di";
import { store } from "@/store";
import "@/i18n/config";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <ReduxProvider store={store}>
            <AppDependenciesProvider>{children}</AppDependenciesProvider>
          </ReduxProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
