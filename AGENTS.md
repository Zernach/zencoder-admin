# Agent guidelines

## Backend & data

- **Always use stubbed backend APIs** that return fake sample data. Do not integrate real backend services unless explicitly requested.
- Stub APIs should live behind **interfaces/abstractions** so they can be swapped for real implementations later without changing UI code.
- **Share the same TypeScript types between the frontend and the stubbed backend.** When the frontend calls the fake stubbed APIs, both sides must use the same request/response types (e.g. `GetDashboardResponse`, `Metric`). Define these types once in a shared module (e.g. `types/` or `api/types`) and import them in both the stub implementation and the frontend services/hooks. No duplicate type definitions—one source of truth so the compiler guarantees the stub’s return shape matches what the frontend expects.
- Return typed, realistic sample data (e.g. lists, pagination, loading delays) so the frontend can handle real-world states.

## TypeScript

- **TypeScript is mandatory.** All code must be written in TypeScript with strict typing. No `any` except where strictly necessary (and then document why).
- Use **explicit types** for function parameters, return values, and public APIs. Let the compiler catch errors at build time.
- Prefer **interfaces and type aliases** for all domain concepts, API contracts, and component props. Shared types live in a dedicated module and are reused everywhere—no inline object shapes for important data.
- Leverage TypeScript for **long-term maintainability**: when you add or change an interface, the compiler surfaces every call site that must be updated.

## Frontend priority

- **The primary deliverable is the frontend**: TypeScript React Native implementation for **iOS, Android, and Web** (Expo).
- All architecture and refactors should prioritize a correct, maintainable, cross-platform UI; backend work is secondary and stubbed.

## Architecture & responsibility split

- **Separate concerns clearly**:
  - **Screens/views**: Layout, composition, and user interaction only. No business logic or direct API calls.
  - **Hooks / view models**: Orchestrate data and state for a screen. Call services, map to UI state, handle loading/error/empty.
  - **Services / repositories**: Single responsibility per domain (e.g. `AnalyticsService`, `UserService`). Depend on **interfaces** (e.g. `IAnalyticsApi`), not concrete HTTP clients.
  - **API layer**: Implement the above interfaces with stubbed responses (e.g. `StubAnalyticsApi`). Keep all fake data and “network” simulation here.
- **Wise use of classes, interfaces, and abstractions** is essential for long-term maintainability:
  - **Interfaces** define contracts (e.g. `IAnalyticsApi`, `IStorage`) so callers depend on behavior, not implementations. New implementations (real API, different storage) can be added without changing consumers.
  - **Classes** (when used) should implement these interfaces and encapsulate one clear responsibility. Prefer small, focused classes over large “god” objects.
  - **Abstractions** (interfaces + dependency injection) keep the codebase flexible: swap stubs for real services, mock in tests, and evolve APIs without breaking the UI layer.
- **Prefer interfaces and dependency injection** for any dependency that might change (API client, storage, feature flags). This keeps tests and future backend swap straightforward.
- **Shared types**: Define domain and API types (e.g. `Metric`, `TimeRange`, `DashboardSummary`, request/response types for each endpoint) in a dedicated module (e.g. `types/` or `api/types`). The **frontend and the stubbed backend must both import and use these same types**—the stub’s return types and the frontend’s expected types are identical. No duplicate type definitions; one source of truth for every API contract.
- **Reusable UI**: Extract shared components (buttons, cards, lists, empty/error states) into a component library or `components/` structure. Screens compose these; they do not reimplement layout primitives.

## Long-term maintainability

- **Classes, interfaces, and abstractions**: Invest in clear contracts (interfaces) and small, single-purpose implementations (classes or modules). This pays off when requirements change, new features are added, or the backend is integrated—the compiler and abstractions guide refactors and prevent regressions.
- **Naming**: Use consistent, domain-driven names for files and exports (e.g. `useDashboardMetrics`, `DashboardMetricsService`, `StubDashboardApi`).
- **File structure**: Group by feature or domain where it helps (e.g. `dashboard/`, `auth/`) and keep a flat or shallow structure so new contributors can find code quickly.
- **Minimal coupling**: Screens and hooks should not import stubs or API implementations directly; they should depend on abstractions (interfaces) provided via props, context, or DI.
- **State**: Prefer a single, predictable state shape per screen (e.g. one hook that returns `{ data, loading, error }`). Avoid scattered `useState` for the same concern.
- **Testing**: Structure so that business logic and state orchestration can be unit tested with stub implementations; UI can be tested with those same stubs.

## Summary

- **TypeScript is critical**: strict typing, explicit types, and shared interfaces/type aliases everywhere.
- Stubbed APIs only; hide them behind interfaces. **Frontend and stub share the same TypeScript types** for every API call (single source of truth).
- Frontend (TypeScript React Native, Expo, iOS/Android/Web) is the main focus.
- **Wise classes, interfaces, and abstractions** are central to long-term maintainability—define contracts, depend on abstractions, keep implementations small and swappable.
- Clear split: screens → hooks/view models → services (against interfaces) → stub API implementations.
- Shared types and reusable components; minimal coupling and dependency injection for maintainability and future backend integration.
