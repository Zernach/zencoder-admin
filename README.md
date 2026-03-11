# Zencoder Admin Dashboard

**[View Production Site](https://zencoder-submission.pages.dev/)**

<p>
  <img src="src/assets/images/zencoder-text-dark-bg.png" width="300" alt="Zencoder Admin icon">
</p>


<p>
  <img src="docs/gifs/demo.gif" width="800" alt="Zencoder Admin demo - desktop and mobile views">
</p>

Cross-platform admin dashboard for AI coding agent analytics, built with Expo + React Native + TypeScript.

## Overview

This app supports all primary platforms from one codebase:

- ✅ iOS
- ✅ Android
- ✅ Web

This repository is frontend-first and currently uses a fully stubbed analytics backend. All dashboard data comes from deterministic seed fixtures through typed interfaces, so real APIs can be swapped in later without changing screen code.

## Product Areas

Main tabs:

| Tab | Primary Focus | Key Implemented Sections |
|---|---|---|
| `Home` | Org-level dashboard and trend monitoring | Live agent sessions, KPI cards, runs/cost trends, usage + outcomes blocks, reliability/provider mix, anomaly cards |
| `Agents` | Reliability and execution performance | Reliability KPIs + charts, agent performance table, project breakdown table, recent runs table, create agent/project flows |
| `Costs` | Spend analysis and forecasting | Budget forecast, cost per project, cost trend, avg cost KPIs, provider cost + token cost views, project cost breakdown |
| `Governance` | Compliance and operational risk | Governance KPI overview, violations by team, team performance comparison, seat user oversight, recent violations, security events, policy changes, create rule/team/user flows |
| `Chat` | AI assistant conversations per section | Chat history with topic filtering (Agents, Costs, Governance, Support), conversation threads with real-time messaging, create chat with tab-scoped suggested prompts, status tracking (active/completed/archived), unread indicators |
| `Settings` | User/org preferences and account config | Profile card, dark mode + notification + auto-refresh toggles, language + currency selection, Slack integration, org plan/seat usage, clear cache, sign-out |

Navigation is responsive:

- Desktop/tablet: collapsible sidebar
- Mobile: bottom tab bar

Global UX available across dashboard screens:

- Top search with autocomplete and entity deep-linking
- Time range presets (`24h`, `7d`, `30d`, `90d`)
- Per-tab entity detail routes (`/dashboard/agent/:agentId`, `/agents/run/:runId`, etc.)

## Architecture

Primary data flow:

1. Screen components (`src/app/...`) compose UI only.
2. Feature hooks prepare view state.
3. RTK Query endpoints call `AnalyticsService`.
4. `AnalyticsService` depends on `IAnalyticsApi`.
5. `StubAnalyticsApi` returns typed fake data with simulated latency.

Dependency injection:

- `AppDependenciesProvider` wires `StubAnalyticsApi` + `AnalyticsService`.
- `initializeService(...)` registers the active service for RTK Query.

Shared contracts:

- All API/domain contracts are defined in `src/features/analytics/types/contracts.ts`.
- The same types are consumed by UI hooks, service layer, and stub API.

## Project Structure

```text
src/
  app/                     Expo Router routes (tabs + entity detail wrappers)
  components/              Reusable UI (shell, charts, tables, forms, modals, etc.)
  constants/               Routes, navigation metadata, platform helpers
  core/di/                 Dependency injection context and wiring
  features/
    analytics/
      api/                 IAnalyticsApi + StubAnalyticsApi
      components/          Feature-specific modals/forms
      fixtures/            Seed data generator
      hooks/               Screen/view-model hooks
      mappers/             API -> view model mapping
      services/            AnalyticsService + interface
      types/               Shared contracts
      utils/               Formatting and metric helpers
    search/                Entity detail screens + hooks + nav helpers
  hooks/                   Shared app hooks
  i18n/                    i18next setup and locale JSON files
  providers/               AppProviders and ThemeProvider
  store/                   Redux Toolkit store, RTK Query API slice, UI slices
  theme/                   Tokens, theme objects, typography, breakpoints
```

## Tech Stack

- Expo 55
- React 19
- React Native 0.83
- TypeScript (strict mode)
- Expo Router
- Redux Toolkit + RTK Query
- i18next / react-i18next
- React Native Reanimated + Moti
- Victory Native + D3 + react-native-svg
- Jest + React Native Testing Library
- Playwright (web E2E)
- Cloudflare Pages (Wrangler)

## Getting Started

### Prerequisites

- Node.js `>=22 <24`
- npm
- Xcode (iOS local runs)
- Android Studio (Android local runs)

### Install

```bash
npm install
```

### Run

```bash
npm start        # Expo dev server
npm run web      # Web
npm run ios      # iOS
npm run android  # Android
```

## Scripts

```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint on src/
npm test            # Jest tests
npm run test:e2e    # Playwright E2E (starts Expo web on :8085)
npm run build       # Expo web export to dist/
npm run deploy      # Build + deploy dist/ to Cloudflare Pages
npm run clean       # Remove generated artifacts + reinstall deps
npm run figma:sync  # Sync/clean Figma spec data into docs/designs/out
npm run ralph -- -p 0   # Run Ralph loop prompt script
```

Notes:

- `figma:sync` expects `FIGMA_TOKEN` in your environment (or `.env`).
- `ralph` expects the `claude` CLI to be installed and accessible in your shell.

## Internationalization and Preferences

- Locales currently included: `bg`, `cs`, `da`, `de`, `el`, `en`, `es`, `fr`, `hr`, `hu`, `it`, `nl`, `pl`, `pt`, `ro`, `ru`, `sr`, `sv`, `tr`, `uk`
- Theme mode support: dark/light
- Currency and language preferences are managed in Redux settings state

## Deployment

`npm run deploy` exports the web build and deploys `dist/` to Cloudflare Pages using Wrangler (`zencoder-submission`).

## License

Private repository. All rights reserved.
