# PR 0038 — Dark & Light Theme Completeness

## Goal

Ensure both dark and light themes work correctly across the entire app — every component, screen, background, text, overlay, status bar, sidebar brand image, and data visualization respects the current theme mode.

## Changes

### 1. DashboardShell — dynamic background
- Replace hardcoded `#0a0a0a` with theme-aware `bg.canvas`

### 2. StatusBar integration
- Add `StatusBar` component to `ScreenWrapper` that switches `barStyle` based on theme mode (`light-content` for dark, `dark-content` for light)

### 3. Modal overlay theming
- Add `overlay` token to `SemanticTheme.bg` (dark: `rgba(0,0,0,0.58)`, light: `rgba(15,23,32,0.38)`)
- Replace hardcoded overlay colors in `TopBar` and `FilterBar`

### 4. Settings danger button
- Move hardcoded `rgba(239,68,68,0.1)` to inline dynamic style using `theme.state.error` with opacity

### 5. Dashboard chart color
- Replace hardcoded `#a855f7` with `theme.data.seriesSecondary` or a dedicated tertiary data color

### 6. Sidebar brand image
- Create/use a light-background variant of the Zencoder logo
- Switch based on current theme mode

### 7. ScreenWrapper SafeAreaView background
- Set `backgroundColor` on the SafeAreaView to `theme.bg.canvas` so it matches on theme switch

## Acceptance

- Toggle dark/light in Settings and confirm all backgrounds, text, borders, overlays, and status bar update correctly
- No hardcoded color literals remain in component/screen files (except data palette which is theme-independent)
