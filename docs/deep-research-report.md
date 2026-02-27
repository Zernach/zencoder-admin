# Organizational Analytics Dashboard for Cloud Agents in React Native

## Product context and mental model

A good “org analytics dashboard” starts by being explicit about **what the product is doing on behalf of engineers**. The closest public reference in your prompt is **Claude Code on the web**, which runs coding tasks **asynchronously on secure cloud infrastructure**. Anthropic’s documentation describes a fairly concrete execution model: the user starts a task; the repository is cloned into an **Anthropic-managed virtual machine**; the environment and network access are configured; Claude performs changes and runs tests; and results are pushed to a branch so the user can create a PR. citeturn6view0

That same doc also describes UX primitives that strongly influence what you should measure and surface in an analytics dashboard:

- **Async sessions** that persist even if the user closes their laptop, and can be monitored from web or mobile. citeturn6view0  
- The ability to start a cloud session from the terminal (e.g., `--remote`) and **teleport** a web session back into the CLI. citeturn6view0  
- A **diff review** surface that shows changes (including lines added/removed) before creating a PR. citeturn6view0  
- Tunable **cloud environment configuration** (environment variables + network access levels), and a default posture where internet access is limited unless configured otherwise. citeturn6view0

A second important anchor is how Anthropic frames enterprise needs. In its “admin controls for business plans” announcement, Anthropic emphasizes that admins need **visibility and controls to scale across the organization**, including self-serve seat management, spend caps, usage analytics, policy enforcement, and a Compliance API. citeturn5view0

From those sources, you can derive a practical mental model for your imaginary product:

- **An org** has users (seats), teams, and repositories/projects integrated into the agent platform.  
- **Runs/sessions** are the unit of work (cloud-executed agent tasks), each with lifecycle states, outcomes, costs, and artifacts (diffs, PRs, logs).  
- **Controls/policies** determine what the agent is allowed to do (tools, file access, network), and must be auditable. citeturn5view0turn6view0  
- **Analytics** should answer “Is it adopted?”, “Is it working?”, “Is it safe?”, and “Is it worth the spend?”

That naturally leads to a dashboard serving multiple “org stakeholder” personas (often in tension): engineering leaders (throughput/outcomes), platform/SRE (reliability), security/compliance (controls + auditability), and finance/FinOps (cost + allocation). Anthropic explicitly calls out admin visibility/controls and real-time programmatic access for governance as core enterprise requirements. citeturn5view0

## What to include in the dashboard

The fastest way to decide scope is to treat this as **two dashboards that share navigation**:

- A **value & adoption dashboard** (who uses agents, what they do, what outcomes happen).  
- A **service & governance dashboard** (reliability, policy, auditability, and spend controls).

A useful organizing principle (for “service health” pages) is Google SRE’s guidance that dashboards should answer basic questions and typically include the **Four Golden Signals: latency, traffic, errors, saturation**. citeturn7search0 For request-driven services, the **RED method** (Rate, Errors, Duration) is a common simplification that maps well to an “agent runs API.” citeturn0search6turn0search10

For “value & adoption,” you can also borrow from the very specific metrics Anthropic exposes for Claude Code usage analytics (e.g., **lines of code accepted**, **suggestion accept rate**, and usage patterns). citeturn5view0 These are unusually actionable because they connect usage to “did people accept the agent’s work?”

### Navigation and page set

Keep the primary nav small (especially for mobile), but allow drill-down. A production-ish IA that still fits an interview take-home typically looks like:

**Overview**  
A single page that answers: “Are we getting value?”, “Is the system healthy?”, “Are we within budget?”, “Any policy/compliance concerns?”

**Usage**  
Adoption, engagement, run volume, and segmentation by team/repo/user/model.

**Outcomes**  
PRs created/merged, diff stats, tests pass rate, suggestion acceptance, rework signals.

**Cost**  
Spend by team/repo/user/model; budget caps; forecasts; unit economics (cost per run / per merged PR).

**Reliability**  
Golden signals / RED; failure modes; queue and capacity; SLO-style trends.

**Governance**  
Policy coverage and violations, tool/file/network restrictions, audit log, retention/deletion.

This mirrors real enterprise controls Anthropic lists (spend controls, seat management, usage analytics, managed policy settings). citeturn5view0

### Metrics that tend to matter for org-wide agent usage

Below is a “high signal” metric set that’s implementable with mocked APIs while still feeling production-grade.

#### Adoption and engagement

Track adoption like a B2B SaaS, but with agent-specific milestones:

- **Seats purchased vs seats active** (active = ran or reviewed an agent run in last 7/30 days). Anthropic frames “self-serve seat management” as a core admin control. citeturn5view0  
- **Activation funnel**: user connects GitHub → installs GitHub app / integration → starts first run → reviews diff → creates PR. Claude’s getting-started steps for web include connecting GitHub, installing the GitHub app in repos, selecting environment, submitting task, and reviewing changes before PR creation. citeturn6view0  
- **WAU/MAU of agent users**, broken down by team, repo, and role (admin vs dev).  
- **Run frequency distribution** (how many users are “power users” vs occasional). This influences whether you optimize for deep drill-down workflows or mostly high-level reporting.

Implementation detail that pays off: store events for each funnel step so the dashboard can show drop-offs.

#### Workload throughput and mix

Because the product is “running agents in the cloud,” the dashboard should make workload tangible:

- **Runs started / completed**, plus in-progress count, by time window.  
- **Run duration** and **time-to-first-result** (if your agent streams intermediate steps).  
- **Queue wait time** and **concurrency** (these map to “saturation”). The SRE “saturation” signal is explicitly about how “full” the service is. citeturn7search0  
- **Run types** (bugfix, refactor, Q&A, tests-only, docs). Claude Code on web positions itself for Q&A, bug fixes, parallel work, and backend changes that write tests then code. citeturn6view0  
- **Repository coverage**: how many repos have ever run an agent; how many in the last 30 days.

Visuals that work well cross-platform: stacked area for run volume by type; small multiples for team-level trends (web), single team selector on mobile.

#### Outcome and quality signals

The “value” story is strongest when you show outcomes in artifacts engineers recognize:

- **PRs created** from agent runs; **PRs merged**; **merge rate** and **median time-to-merge**. Claude Code’s flow explicitly ends in creating a PR from changes pushed to a branch. citeturn6view0  
- **Diff stats**: lines added/removed per run; trending. Claude’s diff view includes an indicator for lines added/removed (e.g., `+12 -1`). citeturn6view0  
- **Suggestion accept rate / lines of code accepted** (or your product’s equivalent), because Anthropic explicitly highlights these as usage analytics that help orgs understand value. citeturn5view0  
- **Tests executed and pass rate** (e.g., “runs where tests passed before PR creation”). Claude Code’s “how it works” describes running tests and checking work as part of execution. citeturn6view0  
- **Rework indicators**: runs that required >N steering iterations, or multiple follow-up runs on the same issue/PR.

If you want a “leadership-friendly KPI,” define one synthetic metric such as:  
**Successful runs that resulted in a PR and passed tests / total runs** (with drill-down for why runs didn’t qualify).

#### Reliability and service health

Separate “agent efficacy” (did it produce good code) from “platform reliability” (did the cloud runner work).

For the platform health page, directly apply SRE guidance and common monitoring methods:

- **Latency/Duration**: p50/p90 run completion time, plus key sub-steps (clone time, environment setup time). Golden signals explicitly include latency. citeturn7search0  
- **Traffic/Rate**: runs per minute/hour/day; API requests; polling/stream events. Golden signals explicitly include traffic. citeturn7search0turn0search6  
- **Errors**: run failure rate; error budget style chart; top error classes. Golden signals include errors; RED includes Errors. citeturn7search0turn0search6  
- **Saturation**: queue depth, worker utilization, throttling rate. Golden signals explicitly include saturation. citeturn7search0  

To keep it implementable, you can use the RED method framing for your core “Run API” endpoints (rate/errors/duration) and golden signals framing where you talk about capacity/saturation. citeturn0search6turn7search0

#### Spend, budgets, and FinOps-style allocation

A cloud agent platform is inherently a cost-allocation problem, so the dashboard should tell a coherent FinOps story.

Anthropic explicitly includes **granular spend controls** at org and individual level, and it frames these as enabling predictability while maintaining flexibility. citeturn5view0 A useful lens for your cost section is the FinOps operating model, which the FinOps Foundation describes with phases like **Inform, Optimize, Operate**. citeturn1search3

A pragmatic cost feature set:

- **Spend over time**, with budget lines and threshold alerts.  
- **Spend by** team, repo, user, model, environment.  
- **Unit costs**: cost per run, cost per successful run, cost per merged PR.  
- **Forecast** (simple trailing average is fine for a take-home).  
- **Caps and enforcement visibility**: who hit caps, when caps were changed.

Even if mocked, showing spend controls in UI aligns with the “admin control” expectations Anthropic outlines. citeturn5view0

#### Environments, network access, and “where runs execute”

This category is easy to overlook and ends up being a differentiator in reviews, because it’s “cloud-agent specific.”

Claude Code on web describes environment setup and network configuration as explicit steps, and notes internet access is limited by default but configurable. citeturn6view0 Your dashboard should therefore include:

- **Runs by environment** (image/toolchain), with failure rates per environment.  
- **Network access level usage** (no internet / limited / full), and trends over time.  
- **Top external domains contacted** (if you allow outbound access), with “blocked attempts” counts; this becomes a security + compliance signal.

## Governance, security, and compliance expectations

“Customer-facing org analytics” in enterprise contexts usually includes governance surfaces, even if you keep them read-only for the take-home.

Anthropic’s business-plan controls give you a clean reference list of what “admin” typically includes for agentic coding at scale:

- Managed policy settings including **tool permissions**, **file access restrictions**, and **MCP server configurations**. citeturn5view0  
- A **Compliance API** with programmatic access to usage data and customer content for observability, auditing, and governance, plus “selective deletion” for retention management. citeturn5view0

### Identity, access control, and provisioning

If this is org-level, reviewers will expect at least a plan for enterprise identity:

- **SAML** is a widely used enterprise federation standard; OASIS hosts the SAML v2.0 standard set. citeturn4search2  
- **OpenID Connect** is an authentication layer on top of OAuth 2.0; the core spec defines OIDC functionality and claims used to communicate user identity. citeturn8search0  
- **SCIM** is an HTTP-based standard for managing identities across domains (enterprise ↔ cloud service). citeturn4search3  

For your dashboard scope, this translates to: show which auth mode the org uses, last SCIM sync, and “users provisioned vs deprovisioned” trends (even if mocked).

### Audit logs and safe logging

Two practical references for what “good logging” means:

- NIST describes log management as the process for generating, transmitting, storing, accessing, and disposing of log data and notes it supports incident investigation, operational troubleshooting, and retention needs. citeturn1search9turn1search1  
- OWASP ASVS warns that logging sensitive information is dangerous because logs then become sensitive themselves; it recommends keeping only necessary information and avoiding credentials/tokens and sensitive/PII data in logs. citeturn1search10  

In dashboard terms, this implies:

- An **audit log viewer** (filter by actor, action, policy change, time).  
- Clear separation between **operational logs** (for engineers) and **audit logs** (for compliance), even if they’re the same data source behind the scenes.  
- A “redaction/PII handling” note in your spec, demonstrating you internalized OWASP’s point. citeturn1search10

### Governance analytics that don’t feel like “just settings”

To make governance “analytics,” not just “config,” include trends:

- Policy changes over time (who changed what, and how it affected violations).  
- Violations by repo/team (e.g., attempts to access restricted domains or files).  
- Runs executed under stricter vs looser policies and their success rates.  
- Data retention actions (deletions) and export activity, aligning to the idea of continuous monitoring and selective deletion described for Anthropic’s Compliance API. citeturn5view0  

## Cross-platform UX guidance for React Native on web and mobile

You’re right to worry about “looking and working good” on both web and mobile. The practical constraint is **data density**: web dashboards tend to be dense; mobile dashboards must prioritize “at-a-glance + drill-down.”

### React Native for Web and Expo as the base

React Native for Web is explicitly designed as a way to use React Native components and APIs on the web, and it is **interoperable with React DOM** and supports incremental adoption in existing apps. citeturn7search11turn7search3 It also emphasizes multi-input interactions (touch/mouse/keyboard) and responsive containers. citeturn7search3

Expo’s documentation describes how to develop websites with Expo, including installing web dependencies such as `react-dom` and `react-native-web`. citeturn2search3 If you want a single repository and shared UI, Expo is a very defensible choice for this assignment.

For navigation, Expo Router is explicitly positioned as a **file-based router for React Native and web applications**, using the same components across Android, iOS, and web. citeturn7search2

### Layout approach that typically works

A strong cross-platform dashboard pattern is:

- A shared “shell” component with **global filters** (time range, team, repo, model) and a content area.
- On **web**: left rail navigation + filter bar + multi-column grid.
- On **mobile**: bottom tabs for the top 3–5 pages + a prominent filter button that opens a modal/bottom sheet.

React Native for Web’s “responsive containers” and multi-input support encourage you to treat resize as a first-class behavior rather than an afterthought. citeturn7search3

A simple “wireframe sketch” of the responsive intent (not final UI):

```text
WEB (wide)
┌───────────────────────────────────────────────────────────────────────┐
│ Org ▾  Time Range ▾  Team ▾  Repo ▾  Model ▾         Export ▾ Alerts 🔔 │
├───────────────┬───────────────────────────────────────────────────────┤
│ Overview      │ KPI Cards (Spend • Runs • Success • PRs • Violations)  │
│ Usage         │ Trend chart (Runs/day)   Trend chart (Spend/day)       │
│ Outcomes      │ Top repos table          Failure reasons bar chart     │
│ Cost          │ Recent runs table (search, filter)                     │
│ Reliability   │                                                       │
│ Governance    │                                                       │
└───────────────┴───────────────────────────────────────────────────────┘

MOBILE (narrow)
┌──────────────────────────────┐
│ Org ▾   Time ▾      Filters ⚙ │
├──────────────────────────────┤
│ KPI Cards (scroll)           │
│ Runs trend (compact)         │
│ Spend trend (compact)        │
│ Alerts / anomalies           │
├──────────────────────────────┤
│ Tabs: Overview Usage Cost …  │
└──────────────────────────────┘
```

### Drill-down design: “overview → explorer → detail”

Most org dashboards fail when they only show charts but don’t support investigation. For your domain, the drill-down chain should end at a **single run/session detail** view:

- Timeline of lifecycle steps (clone → setup → execute → test → push branch). This maps to Claude’s “how it works” steps. citeturn6view0  
- Artifacts: diff stats, PR link, logs (redacted), cost breakdown. Diff stats are explicitly a first-class concept in Claude Code’s UX. citeturn6view0  
- Policy context: which permissions were granted/denied, what network access level was used (since network access is configurable). citeturn6view0turn5view0  

## How to use AI for wireframes and prototypes in a React Native-first workflow

A high-leverage approach is to use AI *to generate options quickly*, then use a consistent rubric (your specs + usability heuristics) to converge.

### AI tools that can accelerate wireframing

You don’t need to pick only one; many teams use at least two in sequence:

Figma-native AI can help at multiple stages, and Figma explicitly positions its AI as automation for design workflows. It also highlights an MCP server that brings Figma design context into agentic coding tools (including Claude), tightening the design-to-code loop. citeturn2search0

For “prompt-to-wireframe,” Uizard’s Autodesigner is explicitly positioned as a tool that can generate multi-screen wireframes from text prompts. citeturn2search1turn2search9

For rapid high-fidelity inspiration, Galileo AI is described as generating UI designs from text prompts as a starting point to refine in design tools. citeturn2search2

And if you want to combine UI generation with code output, Google’s “Stitch” (Labs) is described as converting prompts and visual references into UI designs and styled front-end code, supporting multiple variants and export to Figma. citeturn2news44

### A concrete AI-assisted prototyping loop that fits your assignment

The loop below is designed to keep you moving while producing “good human decisions” (which your rubric explicitly values).

Start with a tight spec, then generate variants:
- Write a 1–2 page dashboard spec (“who/what/why/definitions”).  
- Ask AI to produce 2–3 IA variants (nav + page list) and pick one.  
- Generate low-fi wireframes with Uizard (text → multi-screen) or Figma “First Draft”-style generation (multiple libraries / fidelity levels have been discussed in coverage of Figma’s AI generator). citeturn2search9turn2news45  

Use a rubric to converge:
- Evaluate each wireframe against Jakob Nielsen’s heuristics (visibility of system status, consistency, error prevention, etc.). NN/g publishes a summary of these heuristics. citeturn4search0  
- For dashboards specifically, ensure your overview answers “basic questions,” echoing Google SRE’s dashboard guidance. citeturn7search0

Prototype with real components early:
- Use **Storybook** as a component workshop. Storybook describes itself as a frontend workshop for building UI components and pages in isolation, used for development/testing/documentation. citeturn3search0  
- If you’re on Expo, Expo’s blog explicitly describes setting up Storybook 9 in an Expo app to build/test/share components faster. citeturn3search16  
- Use **Expo Snack** for “prototype in the browser” sharing. Expo describes Snack as an online editor where you can write code and use it instantly on your phone, and the Snack repository explains that Snacks can be saved and easily shared (and embedded) with a web-player. citeturn3search1turn3search5  

Tighten design-to-code with AI:
- If you use Figma, the MCP approach Figma describes (feeding design context into coding agents like Claude) can help keep React Native components aligned with the design system. citeturn2search0  

### Prompt patterns that consistently produce better wireframes

Instead of asking for “a dashboard,” ask for artifacts:

- “Produce an information architecture for an org analytics dashboard for cloud agents. Include nav, page descriptions, primary KPIs per page, and key drill-down paths.”  
- “Generate a mobile-first wireframe for the Overview page where the top 4 KPIs are visible without scrolling, with 2 compact trend charts and an alerts section.”  
- “Generate a web wireframe for the same page, optimized for dense information and quick filtering.”  
- “List the events and data model required to power these screens (runs, costs, PRs, policies, audit events).”

### Guardrails and pitfalls when using AI for UI

AI UI generation can be shockingly fast, but it introduces risk:

- Figma’s AI design generator was publicly pulled and later reintroduced after concerns that it could replicate Apple UI too closely, illustrating the need to review outputs for originality and appropriateness. citeturn2news45  
- Your wireframes should remain grounded in usability heuristics and domain requirements, not “whatever looks good.” NN/g’s heuristics are a good consistency check. citeturn4search0  

## AI-first spec-driven development blueprint for your take-home

Your rubric explicitly asks for AI-first, spec-driven development (requirements → technical spec → testing spec → plan → agentic execution). The fastest way to make this coherent is to treat the dashboard as a **data product** plus a **front-end app**.

### Requirements spec

Include:

- Personas and jobs-to-be-done  
- Page list and drill-down paths  
- Metric definitions (each KPI must have a clear numerator/denominator and time window)  
- Non-goals (what you’re not building)  
- Governance assumptions (what data is sensitive, how you redact)  
- Export requirements (CSV, JSON, “Compliance API” parity)

Using Anthropic’s enterprise controls as reference, it’s reasonable to include spend caps, usage analytics, and policy settings as part of “admin requirements,” even if you implement them read-only. citeturn5view0

### Technical implementation spec

A credible production-leaning architecture is:

- Expo + React Native + react-native-web (single codebase) citeturn2search3turn7search11  
- Expo Router for routes/screens shared across web and mobile citeturn7search2  
- Data fetching layer that supports caching + refetch (React Query or equivalent)  
- Mock API server (JSON fixtures or MSW)  
- A charting approach that works cross-platform (e.g., SVG-based charts)  
- Strict typing for the metrics model (TypeScript)

For observability of your dashboard app itself (not the agent platform), it is defensible to mention OpenTelemetry as a vendor-neutral standard for collecting traces/metrics/logs, especially if your imaginary backend would likely need it. citeturn0search3turn0search7

### Testing spec

Make sure tests prove the dashboard is usable, not just that functions return values:

- KPI formatting and correctness (unit tests)  
- Filters and segmentation (component/integration tests)  
- Navigation flows (mobile tabs, web rail)  
- Accessibility basics (keyboard navigation on web; readable touch targets on mobile)  
- “Run explorer → run detail” acceptance tests because investigation is core to analytics dashboards

If you include outcome metrics like PRs created/merged, it’s reasonable to describe how you would integrate GitHub data; GitHub documents REST endpoints for managing pull requests. citeturn8search3turn8search11

### Step-by-step plan and agentic execution

A nice touch (aligned with the cloud-agent mental model) is to mirror Claude Code’s “plan locally, execute remotely” pattern: Claude’s docs describe starting in a plan-only mode and then kicking off an autonomous remote session. citeturn6view0 Even if you’re not literally using Claude Code on the web, the pattern is strong:

- Plan: finalize requirements + IA + metric definitions  
- Execute: have an agent scaffold screens + mocks + tests in parallel  
- Review: run Storybook + tests, adjust UX, tighten metrics  
- Iterate: add one “wow” capability (e.g., anomaly detection panel or policy-violation trends)

### Mock API surface that feels real

If you build your UI around these mocked endpoints, the result will feel production-shaped:

- `GET /orgs/{orgId}/summary?from&to` (KPIs)  
- `GET /orgs/{orgId}/runs?status&team&repo&from&to` (run explorer)  
- `GET /orgs/{orgId}/runs/{runId}` (detail + artifacts)  
- `GET /orgs/{orgId}/cost?groupBy=team|repo|user|model`  
- `GET /orgs/{orgId}/outcomes?metric=prsMerged|acceptRate|testsPassRate`  
- `GET /orgs/{orgId}/reliability` (golden signals / RED) citeturn7search0turn0search6  
- `GET /orgs/{orgId}/governance/policies` + `GET /orgs/{orgId}/governance/audit-log` (audit log emphasis aligns with NIST + OWASP guidance) citeturn1search9turn1search10  
- `GET /orgs/{orgId}/admin/seats` + `GET /orgs/{orgId}/admin/spend-caps` (mirrors Anthropic’s seat + spend controls) citeturn5view0  

This endpoint list also gives you a clean structure for mocking data and writing end-to-end acceptance tests.

---

If you implement only one thing exceptionally well for the interviews, make it the **Overview → Run Explorer → Run Detail** chain, because it demonstrates (a) real analytics UX, (b) concrete domain modeling grounded in how cloud agent sessions work, and (c) product judgment about what matters to engineers and org admins. citeturn6view0turn5view0