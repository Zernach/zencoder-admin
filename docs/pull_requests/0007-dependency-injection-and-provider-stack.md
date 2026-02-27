# 0007 — Dependency Injection & Provider Stack

> Create `AppDependencies` context, Redux store, React Query client, and the composed `AppProviders` wrapper that every screen inherits. This wires the entire runtime: theme + state + data + DI.

---

## Prior State

ThemeProvider (PR 0002), seed data (PR 0004), StubAnalyticsApi (PR 0005), and AnalyticsService (PR 0006) all exist but are not connected to the app runtime. No Redux store or React Query client exists.

## Target State

`src/app/_layout.tsx` wraps all routes in `<AppProviders>`. Any hook can call `useAppDependencies().analyticsService`, `useAppSelector`, or `useQuery`.

---

## Files to Create

### `src/core/di/AppDependencies.tsx`

```tsx
import { createContext, useContext, useMemo } from "react";
import type { IAnalyticsApi } from "@/features/analytics/api";
import type { IAnalyticsService } from "@/features/analytics/services";
import { StubAnalyticsApi } from "@/features/analytics/api";
import { AnalyticsService } from "@/features/analytics/services";
import { generateSeedData } from "@/features/analytics/fixtures";

interface AppDeps {
  analyticsApi: IAnalyticsApi;
  analyticsService: IAnalyticsService;
}

const Ctx = createContext<AppDeps | null>(null);

export function AppDependenciesProvider({
  children,
  overrides,
}: {
  children: React.ReactNode;
  overrides?: Partial<AppDeps>;  // for tests
}) {
  const deps = useMemo(() => {
    const seedData = generateSeedData(42);
    const api = overrides?.analyticsApi ?? new StubAnalyticsApi(seedData);
    const service = overrides?.analyticsService ?? new AnalyticsService(api);
    return { analyticsApi: api, analyticsService: service };
  }, [overrides]);
  return <Ctx.Provider value={deps}>{children}</Ctx.Provider>;
}

export function useAppDependencies(): AppDeps {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppDependencies must be inside AppDependenciesProvider");
  return ctx;
}
```

### `src/core/di/index.ts`

```ts
export { AppDependenciesProvider, useAppDependencies } from "./AppDependencies";
```

### `src/store/store.ts`

```ts
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    // filtersSlice added in PR 0008
  },
  middleware: (getDefault) => getDefault({ thunk: false }).concat(sagaMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### `src/store/hooks.ts`

```ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### `src/store/index.ts`

```ts
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";
export { useAppDispatch, useAppSelector } from "./hooks";
```

### `src/providers/QueryProvider.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### `src/providers/AppProviders.tsx`

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { AppDependenciesProvider } from "@/core/di";
import { store } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ReduxProvider store={store}>
          <QueryProvider>
            <AppDependenciesProvider>
              {children}
            </AppDependenciesProvider>
          </QueryProvider>
        </ReduxProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

### `src/app/_layout.tsx`

```tsx
import { Slot } from "expo-router";
import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
```

---

## Depends On

- **PR 0002** — `ThemeProvider`.
- **PR 0004** — `generateSeedData`.
- **PR 0005** — `IAnalyticsApi`, `StubAnalyticsApi`.
- **PR 0006** — `IAnalyticsService`, `AnalyticsService`.

## Done When

- `useAppDependencies()` returns `{ analyticsApi, analyticsService }` from any child.
- `useAppSelector(state => state)` works (Redux connected).
- `useQuery` works (React Query connected).
- `AppProviders` renders children without crash.
- `overrides` prop on `AppDependenciesProvider` allows test mocks.
- Root layout wraps `Slot` in full provider stack.
- `npx tsc --noEmit` passes.
