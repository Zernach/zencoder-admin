# 0012 — App Shell, Navigation & Responsive Layout

> Build the `DashboardShell` — collapsible sidebar (264px / 76px), fixed top bar (56px), bottom tabs (mobile), content viewport with responsive grid — plus the Expo Router dashboard layout and the `useBreakpoint` / `useSidebarState` hooks.

---

## Prior State

Theme tokens and breakpoints exist (PR 0002). Global filter state exists (PR 0008). No app shell, no navigation, no responsive layout.

## Target State

Every dashboard screen renders inside `<DashboardShell>`. Web shows sidebar + top bar. Mobile shows top bar + bottom tabs. Sidebar collapses/expands with 220ms animation. Content viewport adjusts responsively.

---

## Files to Create

### `src/hooks/useBreakpoint.ts`

```ts
export function useBreakpoint(): "mobile" | "tablet" | "desktop" {
  // Listen to Dimensions changes.
  // mobile: width < 768, tablet: 768–1023, desktop: ≥1024.
}
```

### `src/hooks/useSidebarState.ts`

```ts
export function useSidebarState(): {
  expanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
} {
  // Persist to AsyncStorage / localStorage.
  // Auto-collapse on tablet breakpoint.
}
```

### `src/components/shell/Sidebar.tsx`

**Expanded** (width: 264px):
- Logo/brand at top.
- Navigation items with icon + label + optional badge count.
- Section dividers.

**Collapsed** (width: 76px):
- Icons only, labels hidden.
- Tooltips on hover/focus (web only).

**Navigation items** (from design content doc):

| Label | Icon (lucide) | Route |
|-------|--------------|-------|
| Dashboard | `LayoutDashboard` | `/(dashboard)/dashboard` |
| Projects | `FolderKanban` | `/(dashboard)/projects` |
| Agents | `Bot` | `/(dashboard)/agents` |
| Runs | `Play` | `/(dashboard)/runs` |
| Costs | `DollarSign` | `/(dashboard)/costs` |
| Governance | `Shield` | `/(dashboard)/governance` |
| Settings | `Settings` | `/(dashboard)/settings` |

**Animation** (Reanimated):
- Shared value for sidebar width.
- `withTiming(targetWidth, { duration: 220, easing: Easing.out(Easing.ease) })`.
- Nav label opacity + translateX fade/slide synchronized.

**Keyboard shortcuts** (web):
- `[` → collapse, `]` → expand.

**Active item**: accent background `#30a8dc` at 10% opacity + accent left border.

### `src/components/shell/SidebarNavItem.tsx`

```tsx
interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number;
  active: boolean;
  expanded: boolean;
}
```

- Icon always visible (24×24).
- Label: visible only when `expanded`, animated opacity.
- Badge: small count pill (e.g., "7" for active alerts).
- Pressable → Expo Router `router.push(route)`.
- Accessible label in both states.
- Min touch target 44×44.

### `src/components/shell/TopBar.tsx`

```tsx
interface TopBarProps {
  onToggleSidebar?: () => void;
}
```

- Fixed height: 56px.
- Left: sidebar toggle button (web/tablet only).
- Center: search input placeholder `"Search agents, projects, runs..."`.
- Right: time range selector (shows current preset: "Last 30 days"), filter button (shows badge with `activeFilterCount`), theme toggle.
- Mobile: search and advanced filters move into a bottom sheet (triggered by filter button).

### `src/components/shell/BottomTabs.tsx`

Mobile only (<768px). Five tabs:

| Tab | Icon | Route |
|-----|------|-------|
| Dashboard | `LayoutDashboard` | `/(dashboard)/dashboard` |
| Projects | `FolderKanban` | `/(dashboard)/projects` |
| Runs | `Play` | `/(dashboard)/runs` |
| Costs | `DollarSign` | `/(dashboard)/costs` |
| More | `MoreHorizontal` | overflow menu → Agents, Governance, Settings |

Active tab: accent color indicator.

### `src/components/shell/ContentViewport.tsx`

```tsx
interface ContentViewportProps {
  children: React.ReactNode;
}
```

- Scrollable content area.
- Left offset animated when sidebar state changes.
- Padding: 24px desktop, 16px tablet, 12px mobile.

### `src/components/shell/DashboardShell.tsx`

Composition:
- Desktop/Tablet: `<Sidebar>` + `<TopBar>` + `<ContentViewport>{children}</ContentViewport>`.
- Mobile: `<TopBar>` + `<ContentViewport>{children}</ContentViewport>` + `<BottomTabs>`.
- Breakpoint detection via `useBreakpoint()`.

### `src/app/(dashboard)/_layout.tsx`

```tsx
import { Slot } from "expo-router";
import { DashboardShell } from "@/components/shell";

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Slot />
    </DashboardShell>
  );
}
```

### `src/components/shell/index.ts`

Barrel export.

---

## Depends On

- **PR 0002** — theme tokens, motion tokens, breakpoints.
- **PR 0008** — `useDashboardFilters` (TopBar shows preset + filter count).
- **PR 0009** — `LoadingSkeleton` (content transition placeholder).

## Done When

- Sidebar renders expanded (264px) with 7 nav items (icon + label).
- Sidebar collapses to 76px (icons only) with 220ms animated transition.
- `[` / `]` keyboard shortcuts toggle sidebar on web.
- Sidebar state persists across page refreshes (stored preference).
- TopBar fixed at 56px with search, time range, filter button, theme toggle.
- BottomTabs render on mobile with 5 tabs.
- Content viewport adjusts left offset on sidebar toggle.
- Layout switches from sidebar → bottom-tabs at <768px.
- Active nav item has accent highlight.
- All nav items route to correct Expo Router paths.
- No layout shift during sidebar toggle.
