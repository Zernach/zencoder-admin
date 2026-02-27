import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "@/store/slices/filtersSlice";
import { AppDependenciesProvider } from "@/core/di/AppDependencies";
import { StubAnalyticsApi } from "@/features/analytics/api/stub/StubAnalyticsApi";
import { AnalyticsService } from "@/features/analytics/services/AnalyticsService";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type { IAnalyticsApi } from "@/features/analytics/api/IAnalyticsApi";

export function createTestSeedData() {
  return generateSeedData(42);
}

export function createTestApi(options?: { failureRate?: number }) {
  const seedData = createTestSeedData();
  return new StubAnalyticsApi(seedData, {
    latencyMinMs: 0,
    latencyMaxMs: 0,
    debugFailureRate: options?.failureRate ?? 0,
  });
}

export function createTestStore() {
  return configureStore({
    reducer: { filters: filtersSlice.reducer },
  });
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

interface TestWrapperProps {
  children: React.ReactNode;
}

// Seed data covers ~2024-12-01 to ~2025-02-27
const SEED_TIME_RANGE = {
  fromIso: "2024-12-01T00:00:00Z",
  toIso: "2025-02-28T00:00:00Z",
};

export function createTestWrapper(overrides?: {
  api?: IAnalyticsApi;
}) {
  const api = overrides?.api ?? createTestApi();
  const service = new AnalyticsService(api);
  const store = createTestStore();
  const queryClient = createTestQueryClient();

  // Set time range to match seed data period (default 30d from "today" won't match)
  store.dispatch(filtersSlice.actions.setCustomTimeRange(SEED_TIME_RANGE));

  function TestWrapper({ children }: TestWrapperProps) {
    return (
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppDependenciesProvider
            overrides={{ analyticsApi: api, analyticsService: service }}
          >
            {children}
          </AppDependenciesProvider>
        </QueryClientProvider>
      </ReduxProvider>
    );
  }

  return { wrapper: TestWrapper, store, queryClient, api, service };
}
