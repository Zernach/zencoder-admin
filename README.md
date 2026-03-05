# 📊 Zencoder Admin Dashboard

<p>
  <img src="src/assets/images/zencoder-text-dark-bg.png" width="300" alt="Zencoder Admin icon">
</p>

Enterprise organizational analytics dashboard for monitoring AI coding agents — built with React Native & Expo.

## ⚙️ Introduction

**Zencoder Admin** gives engineering leaders, FinOps teams, and security officers a single place to understand whether AI agent usage across their organization is adopted, delivering outcomes, reliable, cost-efficient, and governed under policy.

The app supports organization-level reporting and drill-down to team, user, project, and individual run detail — all from one cross-platform codebase:

- ✅ iOS
- ✅ Android
- ✅ Web

## ⚙️ Getting Started

### Prerequisites

- **Node.js** 22.x (LTS)
- **Xcode** (for iOS simulator)
- **Android Studio** (for Android emulator)

### Install & Run

```bash
npm install
```

```bash
npm start        # Expo dev server (press w/i/a for web/iOS/Android)
npm run web      # Web only
npm run ios      # iOS simulator
npm run android  # Android emulator
```

### Other Commands

```bash
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint
npm test            # Jest unit tests
npm run test:e2e    # Playwright end-to-end (web)
npm run build       # Export for web
npm run deploy      # Build & deploy to Cloudflare Pages
npm run clean       # Full clean rebuild
```

## ⚙️ App Tabs

The dashboard is organized into five main tabs — a sidebar on desktop/tablet and a bottom tab bar on mobile:

| # | Tab | Icon | Purpose | Key Features |
|---|-----|------|---------|--------------|
| 1 | **Home** | 🏠 | Organization overview at a glance | Live agent sessions, 4 KPI cards (adoption rate, success rate, total cost, provider mix), trend charts, anomaly detection |
| 2 | **Agents** | 🤖 | Agent performance & reliability deep-dive | Reliability KPIs (P50/P95 duration, error rate, queue wait), agent breakdown table, project breakdown, recent runs list, failure category charts |
| 3 | **Costs** | 💰 | Spending trends & budget tracking | Cost trend area chart, cost-by-project donut, provider cost breakdown, budget forecast with month-end projections, project-level horizontal bar chart |
| 4 | **Governance** | 🛡️ | Policy enforcement & compliance monitoring | Violation tracking, blocked network attempts, audit events, compliance status cards, seat user oversight, security events & policy change tables |
| 5 | **Settings** | ⚙️ | Preferences & organization info | Dark/light mode toggle, notification preferences, Slack integration, auto-refresh, org details, cache management |

## ⚙️ Architecture

```
src/
├── app/                    # Expo Router file-based routes
│   └── (dashboard)/        # Tab screens (dashboard, agents, costs, governance, settings)
├── features/analytics/     # Core business domain
│   ├── types/              # Shared TypeScript contracts (single source of truth)
│   ├── api/                # IAnalyticsApi interface + StubAnalyticsApi implementation
│   ├── services/           # AnalyticsService (depends on interface, not implementation)
│   ├── hooks/              # Screen-level hooks (useOverviewDashboard, useCostDashboard, etc.)
│   ├── fixtures/           # Deterministic seed data
│   ├── mappers/            # Data transformation utilities
│   └── utils/              # Formatters, metric formulas
├── components/
│   ├── shell/              # DashboardShell, Sidebar, BottomTabs, TopBar
│   ├── dashboard/          # KpiCard, SectionHeader, CardGrid, StatusBadge, LoadingSkeleton
│   ├── charts/             # TrendChart, DonutChart, BreakdownChart, ProviderCostChart
│   ├── tables/             # DataTable, SortableHeader, DataList
│   └── filters/            # FilterBar (sticky search + filters)
├── core/di/                # Dependency injection (AppDependencies context)
├── store/                  # Redux Toolkit + Redux Saga (filters, sidebar, loading state)
├── providers/              # AppProviders, ThemeProvider, QueryProvider
├── theme/                  # Design tokens, dark/light themes, typography, breakpoints
└── assets/images/          # App icons & logos
```

### Design Principles

- **Stubbed APIs behind interfaces** — swap in real backends without touching UI code
- **Shared TypeScript types** — one source of truth for API contracts between frontend and stubs
- **Clean separation** — Screens → Hooks → Services → API Interfaces → Stub Implementations
- **Dependency injection** — services are provided via React context for easy testing and swapping
- **Responsive layout** — sidebar nav on desktop/tablet, bottom tabs on mobile, adaptive grids

## ⚙️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React Native 0.83, Expo 55, React 19, TypeScript 5.9 |
| **Routing** | Expo Router (file-based) |
| **State** | Redux Toolkit + Redux Saga, TanStack React Query |
| **UI System** | Tamagui, React Native Reanimated, Moti |
| **Charts** | Victory Native, D3 (scale, array, shape), React Native SVG |
| **Icons** | Lucide React Native |
| **Lists** | Shopify Flash List |
| **Testing** | Jest, React Native Testing Library, Playwright, MSW |
| **Deploy** | Cloudflare Pages (via Wrangler) |

## ⚙️ License

Private — all rights reserved.
