# Low-Fidelity Dashboard Wireframes

## Overview
This is a comprehensive low-fidelity wireframe prototype for an org-level cloud agent analytics dashboard. It demonstrates both **web (desktop)** and **mobile** responsive layouts.

## Design Philosophy
The wireframes use a minimal, brutalist design approach with:
- **Bold borders** (2px, 4px) for clear visual hierarchy
- **Monospace fonts** for data display
- **Grayscale palette** with minimal color (only for status indicators)
- **Box-based layouts** to represent UI components
- **Placeholder charts** with clear labels
- **High contrast** for easy readability

## Screen Structure

### 1. **Overview Dashboard** (`/`)
The main landing page showing organization-level metrics:

#### Sections (Web Layout):
- **Filter Bar**: Date range, search, and filter controls
- **Adoption & Throughput**: 4-card metric grid
  - Active Users
  - Active Agents  
  - Runs/Day
  - Peak Concurrency
- **Charts**: Runs over time, Success rate trend
- **Reliability & Quality**: 5-card metric grid
  - Success Rate, Failure Rate, P50/P95 Duration, Retry Rate
- **Cost & Efficiency**: 4-card metric grid
  - Total Cost, Cost/Run, Total Tokens, Cache Hit Rate
- **Charts**: Cost by project, Failures by category
- **Safety & Governance**: 3-card metric grid
  - Policy Blocks, Secrets Detected, Data Egress
- **Top Projects Table**: Sortable data table

#### Mobile Adaptations:
- Cards stack vertically (1 column)
- Tables show fewer columns
- Charts maintain aspect ratio
- Filter bar stacks controls

---

### 2. **Projects** (`/projects`)
List and analyze all projects in the organization.

#### Features:
- Summary stats (Total Projects, Runs, Agents)
- Charts showing project distribution
- Full project table with metrics
- Click-through to project details

---

### 3. **Project Detail** (`/projects/:id`)
Deep dive into a specific project.

#### Sections:
- Back navigation
- Project-level metrics
- Performance breakdown
- Agents in this project (table)
- Recent runs (table)
- Time-series charts

---

### 4. **Agents** (`/agents`)
View all deployed agents across the organization.

#### Features:
- Agent summary statistics
- Performance comparison charts
- Full agent table with:
  - Name, Project, Runs, Success Rate, Avg Duration

---

### 5. **Runs** (`/runs`)
Real-time view of all agent executions.

#### Features:
- Run statistics (Total, Successful, Failed, Avg Duration)
- Timeline and distribution charts
- Recent runs table with status indicators
- Click-through to run details

---

### 6. **Run Detail** (`/runs/:id`)
Complete trace view of a single run.

#### Sections:
- Run overview (Duration, Cost, Project, Agent)
- Error details (if failed)
- **Execution Timeline**: Step-by-step visualization with:
  - Visual timeline with status indicators
  - Duration per step
  - Error messages
- Metadata (Model, Tokens, Tool Calls, Retries)
- Cost breakdown

---

### 7. **Costs** (`/costs`)
Cost analysis and optimization.

#### Features:
- Top-level cost metrics
- Cost trends over time
- Efficiency metrics (Token cost, Cache savings, Tool call cost)
- Cost breakdown by project
- **Optimization Recommendations** panel

---

### 8. **Governance** (`/governance`)
Security, compliance, and policy enforcement.

#### Sections:
- Governance metrics (Policy Blocks, Secrets, Data Egress)
- Security status cards (Compliance Score, Active Alerts, Audit Events)
- Policy blocks table
- Security events table
- Compliance status checklist
- **Governance Recommendations** panel

---

### 9. **Settings** (`/settings`)
Organization configuration.

#### Sections:
- Organization settings
- Dashboard preferences
- Notification settings (checkboxes)
- API access
- Team members management

---

### 10. **404 Not Found** (`/*`)
Error page with navigation back to dashboard.

---

## Navigation System

### Desktop (≥1024px):
- **Left Sidebar** (fixed, always visible)
  - Logo/Title
  - 7 navigation items with icons
  - User info at bottom
- **Main Content Area** (scrollable)
- No bottom navigation

### Mobile (<1024px):
- **Top Mobile Menu Button** (hamburger)
  - Opens sidebar overlay
- **Bottom Tab Bar** (fixed)
  - 5 primary tabs: Dashboard, Projects, Agents, Runs, Settings
- **Main Content Area** (scrollable with bottom padding)

---

## Component Library

### Wireframe Components (`/src/app/components/wireframe/`)

1. **MetricCard**
   - Title, Value, Change percentage
   - Optional unit and subtitle
   - Trend indicator (up/down arrows)

2. **ChartPlaceholder**
   - Title
   - Chart type label (line, bar, pie, area)
   - Dashed border box
   - Configurable height

3. **DataTable**
   - Optional title
   - Column headers
   - Row data with mono font
   - Click handlers
   - Optional action buttons
   - Responsive (horizontal scroll on mobile)

4. **FilterBar**
   - Search input
   - Date range selector
   - Filter button
   - Responsive stacking

### Layout Components (`/src/app/components/layout/`)

1. **RootLayout**
   - Main flex container
   - Renders Sidebar + Outlet + MobileNav

2. **Sidebar**
   - Desktop: Always visible
   - Mobile: Slide-in overlay with hamburger toggle
   - Navigation items with active state

3. **MobileNav**
   - Fixed bottom tab bar
   - Only visible on mobile (<1024px)
   - 5 primary navigation items

---

## Mock Data (`/src/app/mocks/data.ts`)

All data is realistic and demonstrates:
- Time-series data for charts
- Hierarchical relationships (Org → Project → Agent → Run → Step)
- Status indicators (success/failed)
- Error categorization
- Cost and performance metrics

---

## Responsive Breakpoints

Using Tailwind's default breakpoints:
- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1023px (2 columns where appropriate)
- **Desktop**: ≥ 1024px (sidebar visible, multi-column grids)

---

## Key User Flows

### Flow 1: Overview → Project → Run Detail
1. View dashboard overview
2. Click project in table → Project detail page
3. Click run in recent runs → Run detail with full trace

### Flow 2: Monitoring Failures
1. Navigate to Runs
2. Filter/search for failed runs
3. Click failed run → See error category and step-by-step trace

### Flow 3: Cost Optimization
1. Navigate to Costs
2. Review cost metrics and trends
3. View cost breakdown by project
4. Read optimization recommendations

### Flow 4: Governance Review
1. Navigate to Governance
2. Review policy blocks and security events
3. Check compliance status
4. Review recommendations

---

## Technical Stack

- **React** with TypeScript
- **React Router** (v7) with data router pattern
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Responsive design** (mobile-first approach)

---

## What This Demonstrates

✅ **Complete Information Architecture**
- All key screens for org-level analytics
- Logical drill-down paths
- Proper navigation hierarchy

✅ **Responsive Design**
- Desktop sidebar navigation
- Mobile bottom tabs
- Adaptive layouts (1/2/3/4 columns)
- Stacking components on mobile

✅ **Real-World Dashboard Patterns**
- Metric cards with trends
- Data tables with sorting/filtering
- Chart placeholders
- Status indicators
- Error states
- Loading states (implied)

✅ **User Flows**
- Multi-level drill-downs
- Back navigation
- Filters and search
- Click-through interactions

✅ **Low-Fidelity Best Practices**
- Focus on structure over aesthetics
- Clear visual hierarchy
- Placeholder content with realistic data
- Fast to iterate and modify

---

## Next Steps (Beyond Wireframes)

To convert this to a production dashboard:
1. Replace `ChartPlaceholder` with real charts (Recharts, ECharts)
2. Add real API integration (replace mock data)
3. Implement proper state management (React Query)
4. Add loading and error states
5. Enhance accessibility (ARIA labels, keyboard nav)
6. Add animations and micro-interactions
7. Implement proper authentication
8. Add E2E tests (Playwright)

---

## File Structure

```
/src/app/
├── components/
│   ├── layout/
│   │   ├── RootLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   └── wireframe/
│       ├── MetricCard.tsx
│       ├── ChartPlaceholder.tsx
│       ├── DataTable.tsx
│       └── FilterBar.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   ├── Agents.tsx
│   ├── Runs.tsx
│   ├── RunDetail.tsx
│   ├── Costs.tsx
│   ├── Governance.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── mocks/
│   └── data.ts
├── routes.tsx
└── App.tsx
```

---

## Testing the Wireframes

### Desktop View
1. Open in browser at full width (≥1024px)
2. Navigate through all pages using sidebar
3. Test drill-downs (click tables, metrics)
4. Verify all routes work

### Mobile View
1. Resize browser to <640px OR use device emulator
2. Test hamburger menu
3. Test bottom tab navigation
4. Verify tables scroll horizontally
5. Check that cards stack vertically

### Interactions
- Click metric cards
- Click table rows
- Use back buttons
- Navigate between all screens
- Test 404 page

---

This wireframe prototype provides a complete, navigable, responsive foundation for building a production org-level agent analytics dashboard.
