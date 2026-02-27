# 0019 — Settings Screen

> Build the Settings screen: org info display, dashboard preferences, notification toggles, API key management (masked + copy), and team member list. Settings persist through a stubbed service interface.

---

## Prior State

DashboardShell and UI primitives exist. No settings domain module exists.

## Target State

`/(dashboard)/settings` renders a form-style configuration screen with toggles, selects, and a team list. All state persists via a stubbed settings service.

---

## Files to Create

### `src/features/settings/types/settingsTypes.ts`

```ts
export interface OrgSettings {
  orgName: string;
  orgId: string;
}

export interface DashboardPreferences {
  defaultTimeRange: TimeRangePreset;
  autoRefresh: boolean;
}

export interface NotificationSettings {
  policyViolations: boolean;
  highFailureRates: boolean;
  costAlerts: boolean;
  securityEvents: boolean;
}

export interface TeamMember {
  email: string;
  role: "admin" | "member";
  isSelf: boolean;
}

export interface AppSettings {
  org: OrgSettings;
  preferences: DashboardPreferences;
  notifications: NotificationSettings;
  apiKey: string;
  teamMembers: TeamMember[];
}
```

### `src/features/settings/hooks/useSettings.ts`

```ts
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  // Returns { settings, updatePreference, updateNotification, loading }
  // Stubbed persistence — stores in component state (or AsyncStorage for extra credit)
}

const defaultSettings: AppSettings = {
  org: { orgName: "Acme Corp", orgId: "org_abc123xyz" },
  preferences: { defaultTimeRange: "30d", autoRefresh: true },
  notifications: { policyViolations: true, highFailureRates: true, costAlerts: true, securityEvents: true },
  apiKey: "sk_live_abc123xyz789def456ghi",
  teamMembers: [
    { email: "admin@acme.com", role: "admin", isSelf: true },
    { email: "john@acme.com", role: "member", isSelf: false },
    { email: "sarah@acme.com", role: "member", isSelf: false },
  ],
};
```

### `src/app/(dashboard)/settings.tsx`

```
Header: "Settings" / "Configure your organization preferences"

Section: "Organization Settings"
  Read-only field: "Organization Name" → "Acme Corp"
  Read-only field: "Organization ID" → "org_abc123xyz" + Copy button

Section: "Dashboard Preferences"
  Select: "Default Time Range" (24h/7d/30d/90d) — helper: "Default view for analytics"
  Toggle: "Auto Refresh" — helper: "Automatically update dashboard" — default ON

Section: "Notification Settings"
  Toggle: "Policy Violations"    — helper: "Notify when policy blocks occur"
  Toggle: "High Failure Rates"   — helper: "Alert when failure rate exceeds 10%"
  Toggle: "Cost Alerts"          — helper: "Notify when daily costs exceed threshold"
  Toggle: "Security Events"      — helper: "Alert on suspicious activity"

Section: "API Access"
  Masked field: "API Key" → "sk_live_...789def456ghi" (show last 12 chars)
  Button: "Copy" — copies full key to clipboard
  Button: "Regenerate API Key" — shows confirmation dialog before action

Section: "Team Members"
  Button: "+ Invite"
  Member rows:
    admin@acme.com — "Admin · You" badge
    john@acme.com  — "Member" badge
    sarah@acme.com — "Member" badge
```

**Responsive**: Web: two-column form layout. Mobile: single-column stack with sticky save area.

---

## Depends On

- **PR 0002** — theme. **PR 0009** — SectionHeader. **PR 0012** — shell.

## Done When

- Org name and ID display correctly.
- Copy button copies org ID / API key to clipboard.
- Time range select changes value.
- Auto refresh toggle works.
- All 4 notification toggles render with helper text.
- API key is masked, showing only last 12 characters.
- Regenerate shows confirmation dialog.
- Team list shows 3 members with role badges.
- Settings persist in state between re-renders.
- Responsive: two-col web, single-col mobile.
