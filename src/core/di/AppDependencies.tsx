import React, { createContext, useContext, useMemo } from "react";
import type { IAnalyticsApi } from "@/features/analytics/api";
import type { IAnalyticsService } from "@/features/analytics/services";
import type { SeedData } from "@/features/analytics/types";
import { StubAnalyticsApi } from "@/features/analytics/api";
import { AnalyticsService } from "@/features/analytics/services";
import { generateSeedData } from "@/features/analytics/fixtures";

interface AppDeps {
  analyticsApi: IAnalyticsApi;
  analyticsService: IAnalyticsService;
  seedData: SeedData;
}

const Ctx = createContext<AppDeps | null>(null);

export function AppDependenciesProvider({
  children,
  overrides,
}: {
  children: React.ReactNode;
  overrides?: Partial<AppDeps>;
}) {
  const deps = useMemo(() => {
    const seedData = overrides?.seedData ?? generateSeedData(42);
    const api = overrides?.analyticsApi ?? new StubAnalyticsApi(seedData, {
      latencyMinMs: 80,
      latencyMaxMs: 300,
    });
    const service =
      overrides?.analyticsService ?? new AnalyticsService(api);
    return { analyticsApi: api, analyticsService: service, seedData };
  }, [overrides]);
  return <Ctx.Provider value={deps}>{children}</Ctx.Provider>;
}

export function useAppDependencies(): AppDeps {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useAppDependencies must be inside AppDependenciesProvider"
    );
  return ctx;
}
