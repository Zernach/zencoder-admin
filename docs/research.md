Here’s an AI-first way to get from “dashboard idea” → **wireframes/prototype** → **production-ish React Native (web + mobile)** with solid specs + tests, without getting stuck in design purgatory.

---

## 1) How to use AI for wireframes/prototypes (RN web + mobile)

### The core trick: prototype the **information architecture + interactions** first, not pixels

For dashboards, “good” is mostly:

* the right **metrics**
* the right **groupings**
* the right **drill-down paths**
* sane **time range + filters**
* fast-feeling UI states (loading/empty/error)

**AI excels at** rapidly generating: screen lists, component inventories, flows, and “what happens when…” behavior.

#### A good AI loop (fast + high-signal)

1. **Describe the user + jobs-to-be-done**
   “Org admin wants to understand reliability, cost, and adoption of cloud agents.”
2. Ask AI for:

   * **dashboard sections**
   * **metrics definitions**
   * **filters**
   * **drilldown flows**
3. Ask AI to output **wireframe-ready structure**:

   * a screen list
   * each screen: sections + components + states

**AI prompts you’ll actually reuse**

* “Generate a dashboard IA and drilldown flow for org-level cloud agent analytics. Output as a sitemap + per-screen component lists.”
* “Write microcopy for empty states, error states, and tooltips for each metric.”

#### Route B: “Prototype in code” using Expo Router + mocked APIs

* You build the real navigation + layout early.
* You get responsiveness (web/mobile) and interaction feel immediately.
* Benefits: by the time you “finish the prototype,” you’re already 60% into production.

**This is usually best for your assignment**, because they’ll review code + tests.

---

## 2) Product decisions: what this dashboard should show (org-level)

For “engineers running agents in the cloud,” the org-level dashboard should answer four questions:

### A) Adoption & throughput

* **Active users** (daily/weekly)
* **Active agents / runs** (runs/day)
* **Top projects/workspaces** by runs
* **Peak concurrency** (and throttling events)

### B) Reliability & quality

* **Success rate** (% runs that complete)
* **Failure rate by category** (timeouts, tool errors, model errors, policy blocks, infra)
* **p50/p95 duration** per run
* **Retry rate**
* **Human intervention rate** (if applicable)

### C) Cost & efficiency

* **Total cost** (time range)
* **Cost per run**
* **Tokens in/out** (if LLM-based)
* **Tool-call volume** & cost hotspots
* **Cache hit rate** (if you support caching)

### D) Safety & governance (org-level is where this matters)

* **Policy blocks** count + reasons
* **Secrets scanning hits** (if you track)
* **Data egress** (downloads/uploads) volume
* **RBAC changes / audit log summary**

### Minimum drill-downs that feel “real”

* Org → Project → Agent → Run → Step/Trace
* Every chart should support: click to filter / jump to relevant table.

---

## 3) React Native implementation approach that works on web + mobile

### Stack (battle-tested for RN + web dashboards)

* **Expo (managed)** + **expo-router**
* **react-native-web** (comes with Expo)
* UI kit: **Tamagui** *or* **NativeWind**

  * Tamagui is great for dashboards (tokens, responsive props, web feel)
* Data: **@tanstack/react-query** + **Zod** for runtime validation
* Charts:

  * Web: consider **ECharts** via a thin wrapper (WebView on mobile if needed), *or*
  * Cross-platform: **victory-native** (works, but web feel varies), *or*
  * “Good enough for assignment”: basic charts in RN SVG + minimal library
* Table: a custom “virtualized-ish” list for mobile, and a richer table for web

**Pragmatic dashboard UI rule:**
On mobile, prioritize **summary + top 5 lists** and push heavy tables into drilldowns.

### Responsive layout strategy (so it doesn’t feel like a stretched phone UI)

* Use **breakpoints**: `sm / md / lg`
* Layout:

  * **lg (web)**: 12-col grid style cards, left nav rail
  * **sm (mobile)**: stacked cards, bottom tabs for key sections
* Keep navigation consistent:

  * `Dashboard`, `Projects`, `Agents`, `Runs`, `Costs`, `Governance`, `Settings`

---

## 4) AI-first spec-driven development (what you should produce)

Below is the exact set of artifacts I’d generate (and keep in `/docs`) so interviewers can see “AI-first done right.”

### 4.1 Requirements spec (product)

Include:

* Personas (Org Admin, Eng Manager, FinOps, Security)
* Jobs-to-be-done
* Screens + success criteria
* Metric definitions (precise!)
* Filters (time range, project, agent, env, model, status)
* Non-functional: performance targets, accessibility, auditability

### 4.2 Technical implementation spec

Include:

* App architecture (routing, layout shells)
* Data model + API contract (even mocked)
* State management approach (react-query cache, URL params on web)
* Chart/table rendering approach
* Auth assumptions (mock org)
* Observability (basic logging)

### 4.3 Testing spec (TDD + acceptance)

Include:

* Unit tests: metric formatting, zod parsing, reducers/helpers
* Component tests: cards, tables, filter bar
* Integration tests: “change time range updates charts/tables”
* E2E:

  * Web: **Playwright**
  * Mobile: **Detox** (optional; at least show intent + 1–2 tests)

### 4.4 Step-by-step plan

Make it granular and check-boxable:

1. scaffold Expo + router + UI kit
2. layout shell + nav
3. mocked API + MSW
4. dashboard cards
5. drilldowns
6. filters + URL state
7. test harness
8. polish + storybook (optional)

### 4.5 Agentic execution (how to actually use Claude Code)

You want to “delegate” chunks that are:

* well-specified
* independently testable
* easy to review

Good agent tasks:

* “Implement dashboard layout shell + navigation”
* “Implement metrics cards with skeleton states”
* “Implement mock API + zod schemas + react-query hooks”
* “Add Playwright smoke tests for core flows”

Bad agent tasks:

* “Build the dashboard” (too broad, you’ll get incoherent structure)

---

## 5) Mock API + data model (keep it realistic, not random)

Design your API around analytics queries:

### Endpoints (mocked)

* `GET /orgs/:orgId/analytics/overview?from&to&projectId?`
* `GET /orgs/:orgId/analytics/projects?from&to`
* `GET /orgs/:orgId/analytics/agents?from&to&projectId?`
* `GET /orgs/:orgId/analytics/runs?from&to&filters...`
* `GET /orgs/:orgId/analytics/run/:runId` (trace)

### Entities you’ll want in mocks

* Org, Project, Agent, Run, Step
* Metric series: `{ ts, value }`
* Breakdowns: `{ key, value, delta? }`

Then use **MSW** (Mock Service Worker) on web and node-based mocks on native to keep it consistent.

---

## 6) Concrete “AI prompts” for wireframes → RN components

Use these exactly (and paste outputs into docs / issues):

### Prompt: dashboard wireframe spec

> You are a product designer for an org-level analytics dashboard for cloud agent runs.
> Output a sitemap and then for each screen: sections, components, tables, charts, filters, and empty/loading/error states.
> Make it responsive: web (desktop) and mobile.
> Keep it implementable in React Native + Expo Router.

### Prompt: metric definitions

> Define 15–25 metrics for org-level cloud agent analytics.
> For each metric: name, formula/definition, type (counter/gauge/ratio), dimensions (project/agent/model/env), and why it matters.

### Prompt: RN component inventory

> Based on this wireframe spec, produce a React Native component inventory and folder structure.
> Include props interfaces and which components are shared vs screen-specific.

### Prompt: acceptance tests

> Write Gherkin acceptance tests for the key flows:
>
> * overview shows correct totals
> * changing date range updates charts and tables
> * clicking a project filters runs
> * run detail shows steps and error categorization

---

## 7) What I’d build for your assignment (scope that looks “production”)

If you want this to land well in interviews, aim for:

* A **polished Overview dashboard**
* 2–3 drilldowns (Projects, Runs list, Run detail)
* Strong filter UX
* Realistic mocked API + schemas
* Web E2E tests + solid unit/component coverage

That’s enough to feel complete without spending forever on chart perfection.

---

## 8) Suggested repo structure (clean + reviewable)

* `/apps/expo` (if monorepo) or root Expo app
* `/src`

  * `/app` (expo-router routes)
  * `/components` (shared UI)
  * `/features/analytics` (domain modules)

    * `api.ts`, `schemas.ts`, `hooks.ts`, `formatters.ts`
  * `/mocks` (MSW handlers + seed data)
  * `/theme` (tokens, breakpoints)
* `/docs`

  * `requirements.md`
  * `tech-spec.md`
  * `testing-spec.md`
  * `plan.md`
* `/tests`

  * `playwright/`

---

If you want, paste **your intended dashboard sections** (even just bullets), and I’ll turn them into:

* a tight **wireframe spec (per screen + components + states)**, and
* a **requirements + tech + testing spec** that’s ready to hand to Claude Code for implementation.
