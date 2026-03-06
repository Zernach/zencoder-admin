import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { filtersSlice } from "@/store/slices/filtersSlice";
import { loadingSlice } from "@/store/slices/loadingSlice";
import { sidebarSlice } from "@/store/slices/sidebarSlice";
import { analyticsApi } from "@/store/api/analyticsApi";
import { initializeService } from "@/store/api/serviceRegistry";
import { AppDependenciesProvider } from "@/core/di/AppDependencies";
import { StubAnalyticsApi } from "@/features/analytics/api/stub/StubAnalyticsApi";
import { AnalyticsService } from "@/features/analytics/services/AnalyticsService";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type { IAnalyticsApi } from "@/features/analytics/api/IAnalyticsApi";

export function createTestSeedData() {
  return generateSeedData(42);
}

function timeRangeFromRuns(runs: { startedAtIso: string }[]): { fromIso: string; toIso: string } {
  if (runs.length === 0) {
    const d = new Date();
    return {
      fromIso: new Date(d.getTime() - 90 * 86_400_000).toISOString(),
      toIso: d.toISOString(),
    };
  }
  const sorted = [...runs].sort((a, b) => a.startedAtIso.localeCompare(b.startedAtIso));
  return { fromIso: sorted[0]!.startedAtIso, toIso: sorted[sorted.length - 1]!.startedAtIso };
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
    reducer: {
      filters: filtersSlice.reducer,
      loading: loadingSlice.reducer,
      sidebar: sidebarSlice.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(analyticsApi.middleware),
  });
}

interface TestWrapperProps {
  children: React.ReactNode;
}

export function createTestWrapper(overrides?: {
  api?: IAnalyticsApi;
  seedData?: ReturnType<typeof generateSeedData>;
}) {
  const seedData = overrides?.seedData ?? createTestSeedData();
  const api = overrides?.api ?? new StubAnalyticsApi(seedData, {
    latencyMinMs: 0,
    latencyMaxMs: 0,
    debugFailureRate: 0,
  });
  const service = new AnalyticsService(api);
  const store = createTestStore();

  // Initialize service registry for RTK Query endpoints
  initializeService(service);

  // Set time range to match seed data (derived from runs so tests pass regardless of current date)
  store.dispatch(filtersSlice.actions.setCustomTimeRange(timeRangeFromRuns(seedData.runs)));

  function TestWrapper({ children }: TestWrapperProps) {
    return (
      <ReduxProvider store={store}>
        <AppDependenciesProvider
          overrides={{ analyticsApi: api, analyticsService: service }}
        >
          {children}
        </AppDependenciesProvider>
      </ReduxProvider>
    );
  }

  return { wrapper: TestWrapper, store, api, service };
}
