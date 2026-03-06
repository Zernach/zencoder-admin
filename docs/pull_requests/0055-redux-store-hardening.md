# PR 0055 — Redux Store Hardening

## Goal
Clean up the Redux store configuration by removing dead code, adding properly typed and memoized selectors for all slices, and aligning the test store with production.

## Changes

### 1. Remove Redux Saga (dead code)
- Remove `redux-saga` import and middleware from `store.ts`
- Remove `redux-saga` from `package.json` dependencies
- Delete empty `src/store/sagas/` directory
- Re-enable thunk middleware (default RTK behavior, needed for RTK Query)

### 2. Typed selectors for all slices
- **sidebarSlice**: Export `selectSidebarExpanded` memoized selector
- **loadingSlice**: Export `LoadingState` type
- **filtersSlice**: Already has good selectors — no changes needed

### 3. Fix test store
- Update `createTestStore()` in `testUtils.tsx` to include ALL reducers (filters, loading, sidebar) matching production store

### 4. Update store index exports
- Export sidebar selectors from `slices/index.ts`
- Export loading actions and selectors from `slices/index.ts`

### 5. Use exported selectors in components
- Update `DashboardShell.tsx` to use `selectSidebarExpanded` instead of inline selector

## Files Changed
- `src/store/store.ts`
- `src/store/slices/sidebarSlice.ts`
- `src/store/slices/loadingSlice.ts`
- `src/store/slices/index.ts`
- `src/store/index.ts`
- `src/components/shell/DashboardShell.tsx`
- `src/testing/testUtils.tsx`
- `package.json`
- Delete: `src/store/sagas/` directory
