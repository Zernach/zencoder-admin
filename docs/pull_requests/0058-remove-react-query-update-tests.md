# PR 0058 — Remove React Query & Update Test Infrastructure

## Goal
Remove `@tanstack/react-query` entirely, update the provider stack, and update all test utilities and test files to use RTK Query-backed store.

## Changes

### 1. Remove React Query
- Remove `@tanstack/react-query` from `package.json`
- Delete `src/providers/QueryProvider.tsx`
- Remove `QueryProvider` from `AppProviders.tsx` stack

### 2. Update Test Utilities
- Update `createTestStore()` to include `analyticsApi.reducer`
- Update `createTestWrapper()` to initialize service registry instead of QueryClient
- Remove all `QueryClientProvider` usage from test wrappers

### 3. Update Test Files
- Update hook tests that used `createTestWrapper` with React Query
- Update screen tests that rendered with query providers
- Update integration tests
- Ensure all 266+ tests pass

## Files Changed
- Modify: `package.json`
- Delete: `src/providers/QueryProvider.tsx`
- Modify: `src/providers/AppProviders.tsx`
- Modify: `src/testing/testUtils.tsx`
- Modify: All test files that reference React Query
