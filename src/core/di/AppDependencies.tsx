import React, { createContext, useContext, useMemo } from "react";
import type { IAnalyticsApi } from "@/features/analytics/api";
import type { IAnalyticsService } from "@/features/analytics/services";
import type { SeedData } from "@/features/analytics/types";
import { StubAnalyticsApi } from "@/features/analytics/api";
import { AnalyticsService } from "@/features/analytics/services";
import type { IChatApi } from "@/features/chat/api";
import type { IChatService } from "@/features/chat/services";
import { StubChatApi } from "@/features/chat/api";
import { ChatService } from "@/features/chat/services";
import { generateSeedData } from "@/features/analytics/fixtures";
import { initializeService } from "@/store/api/serviceRegistry";

interface AppDeps {
  analyticsApi: IAnalyticsApi;
  analyticsService: IAnalyticsService;
  chatApi: IChatApi;
  chatService: IChatService;
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
    const analyticsApi = overrides?.analyticsApi ?? new StubAnalyticsApi(seedData, {
      latencyMinMs: 80,
      latencyMaxMs: 300,
    });
    const analyticsService =
      overrides?.analyticsService ?? new AnalyticsService(analyticsApi);
    const chatApi =
      overrides?.chatApi ?? new StubChatApi({ latencyMinMs: 80, latencyMaxMs: 260 });
    const chatService =
      overrides?.chatService ?? new ChatService(chatApi);
    initializeService(analyticsService);
    return {
      analyticsApi,
      analyticsService,
      chatApi,
      chatService,
      seedData,
    };
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
