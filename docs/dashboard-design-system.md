# Dashboard Design System (Zencoder Admin)

## Purpose
This document defines the visual tokens and style rules for a clean, professional analytics dashboard in Expo React Native (iOS, Android, Web). It is written so implementation can be one-shot by an LLM agent.

## Design direction
- Enterprise, data-dense, low-noise UI.
- Dark theme first for analytics workflows, with full light-theme parity.
- Strong contrast and clear hierarchy over decorative visuals.
- Consistent tokenized styling only (no ad-hoc per-screen values).

## Core color palette (Zencoder inspired)
- `base.black`: `#000000`
- `base.nearBlack`: `#0a0a0a`
- `base.surfaceDark`: `#1a1a1a`
- `base.surfaceDarkAlt`: `#262626`
- `brand.accent`: `#30a8dc`
- `text.primaryDark`: `#e5e5e5`
- `text.inverse`: `#ffffff`
- `text.secondaryDark`: `#a3a3a3`

## Semantic color tokens
Define semantic tokens once and map per theme.

### Dark theme
- `bg.canvas`: `#0a0a0a`
- `bg.subtle`: `#121212`
- `bg.surface`: `#1a1a1a`
- `bg.surfaceElevated`: `#262626`
- `bg.surfaceHover`: `#2f2f2f`
- `bg.brandSubtle`: `rgba(48, 168, 220, 0.14)`
- `border.default`: `#2d2d2d`
- `border.subtle`: `#242424`
- `border.strong`: `#3a3a3a`
- `border.brand`: `#30a8dc`
- `text.primary`: `#e5e5e5`
- `text.secondary`: `#a3a3a3`
- `text.tertiary`: `#7a7a7a`
- `text.brand`: `#67c4ea`
- `text.onBrand`: `#00131c`
- `icon.primary`: `#dcdcdc`
- `icon.secondary`: `#9b9b9b`
- `state.success`: `#22c55e`
- `state.warning`: `#f59e0b`
- `state.error`: `#ef4444`
- `state.info`: `#38bdf8`
- `data.gridLine`: `#2a2a2a`

### Light theme
- `bg.canvas`: `#f6f7f8`
- `bg.subtle`: `#eef1f4`
- `bg.surface`: `#ffffff`
- `bg.surfaceElevated`: `#fbfdff`
- `bg.surfaceHover`: `#f3f6f9`
- `bg.brandSubtle`: `rgba(48, 168, 220, 0.12)`
- `border.default`: `#d7dde3`
- `border.subtle`: `#e4e8ec`
- `border.strong`: `#c5ced8`
- `border.brand`: `#2b9fce`
- `text.primary`: `#0f1720`
- `text.secondary`: `#435160`
- `text.tertiary`: `#6b7683`
- `text.brand`: `#0f7ea9`
- `text.onBrand`: `#ffffff`
- `icon.primary`: `#1f2c39`
- `icon.secondary`: `#5a6877`
- `state.success`: `#16803d`
- `state.warning`: `#a16207`
- `state.error`: `#b91c1c`
- `state.info`: `#0369a1`
- `data.gridLine`: `#e3e7eb`

## Typography
Use one readable sans family for UI and one mono family for technical values.

- Sans: `Inter` (400, 500, 600, 700)
- Mono: `Menlo` (400, 600)

### Type scale tokens
- `font.size.xs`: `11`
- `font.size.sm`: `12`
- `font.size.md`: `14`
- `font.size.lg`: `16`
- `font.size.xl`: `18`
- `font.size.2xl`: `22`
- `font.size.3xl`: `28`

- `lineHeight.tight`: `1.2`
- `lineHeight.normal`: `1.45`
- `lineHeight.relaxed`: `1.6`

### Usage rules
- Page title: `2xl/700`
- Section title: `xl/600`
- Card title: `md/600`
- Body text: `md/400`
- Table body: `sm/400`
- Label/caption: `xs/500`
- KPI value: `3xl/700` desktop, `2xl/700` mobile
- Numeric code-like values (run ID, token count internals): mono `sm/600`

## Spacing and sizing
Use a 4pt base grid.

- `space.0`: `0`
- `space.1`: `4`
- `space.2`: `8`
- `space.3`: `12`
- `space.4`: `16`
- `space.5`: `20`
- `space.6`: `24`
- `space.8`: `32`
- `space.10`: `40`
- `space.12`: `48`

### Layout spacing
- App shell horizontal padding: `24` desktop, `16` tablet, `12` mobile
- Card padding: `16` default, `20` dense desktop card
- Grid gap: `16` desktop, `12` tablet/mobile
- Vertical section gap: `24`
- KPI card min-height: `132`
- Top filter bar height: `56`

## Radius, borders, elevation
- `radius.sm`: `6`
- `radius.md`: `10`
- `radius.lg`: `14`
- `radius.xl`: `18`
- `radius.full`: `999`

- `border.width.hairline`: `1`
- `border.width.strong`: `2`

### Elevation tokens
- `shadow.none`: `none`
- `shadow.sm`: subtle y=1 blur=4
- `shadow.md`: y=4 blur=14
- `shadow.lg`: y=8 blur=28

Rules:
- Dark theme uses low shadow + stronger border contrast.
- Light theme uses soft shadow + subtle border.
- Avoid heavy shadows on data tables; use borders and background tiers.

## Component style rules

### Cards
- Base background: `bg.surface`
- Border: `1px border.default`
- Radius: `radius.lg`
- Header gap: `8`
- Optional top accent strip: `2px` using `brand.accent`

### KPI cards
- Value uses `KPI value` token.
- Delta badge states:
  - Positive: `state.success` text on subtle success background.
  - Negative: `state.error` text on subtle error background.
  - Neutral: `text.secondary`.

### Tables
- Header background: `bg.subtle`
- Row background: transparent to `bg.surfaceHover` on hover/focus
- Row height: `44` mobile, `40` desktop
- Cell horizontal padding: `12`
- Sticky header on web.

### Inputs and filters
- Input height: `40`
- Border radius: `radius.md`
- Focus ring: 2px `border.brand` + 2px outer alpha brand glow
- Placeholder text: `text.tertiary`

### Charts
- Plot background follows card background.
- Grid lines: `data.gridLine`.
- Primary series: `brand.accent`.
- Secondary series: muted teal/gray tokenized per theme.
- Always include readable axes and tooltips with `sm` typography.

## Theme behavior
- Respect system theme by default.
- Persist manual override (`light`, `dark`, `system`) in app state.
- Theme switch must be instant, no page reload.
- All colors must come from semantic tokens, never raw hex in components.

## Accessibility requirements
- Meet WCAG AA contrast for text and controls.
- Focus-visible ring on all interactive elements (web).
- Minimum touch target `44x44`.
- Never rely on color only for status; pair with icon/label.

## Implementation checklist for agent
- Create token module: `src/theme/tokens.ts`.
- Create semantic theme map: `src/theme/themes.ts`.
- Add typography helpers in `src/theme/typography.ts`.
- Build reusable primitives (`Card`, `KpiCard`, `AppText`, `Badge`, `DataTable`) using tokens only.
- Add lint rule or code review rule forbidding hard-coded hex in feature screens.
