# 0002 — Design System & Theme Provider

> Wire the existing `src/theme/` token maps into a live Tamagui runtime provider, add motion timing and breakpoint constants, and expose `ThemeProvider` so every downstream component can consume design tokens from context.

---

## Prior State

`src/theme/tokens.ts`, `themes.ts`, `typography.ts` exist with raw value maps. Tamagui is installed (PR 0001) but unconfigured. No runtime theme provider exists.

## Target State

Any component can call `useTheme()` to get typed color/spacing/radius/font tokens. `motion`, `ease`, and `breakpoints` are importable constants. Dark is the default theme; light is available.

---

## Files to Create

### `tamagui.config.ts` (project root)

Call `createTamagui` registering:

| Token Group | Values |
|-------------|--------|
| **colors** | dark canvas `#0a0a0a`, surface `#1a1a1a`, elevated `#262626`, accent `#30a8dc`, text.primary `#e5e5e5`, text.secondary `#a3a3a3`, text.tertiary `#7a7a7a`, success `#22c55e`, warning `#f59e0b`, error `#ef4444`, info `#38bdf8` — plus light theme inversions |
| **space** | 4pt grid: keys `0..16` → values `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192` px |
| **radius** | `sm: 6`, `md: 10`, `lg: 14`, `xl: 18`, `full: 999` |
| **fonts** | `Inter` (400, 500, 600, 700), `Menlo` (400, 600). Size scale: xs=11, sm=12, md=14, lg=16, xl=18, 2xl=22, 3xl=28 |
| **shadows** | Per-theme: none, sm, md, lg with opacity-adjusted blacks |

Register two themes: `dark` (default) and `light`.

### `src/theme/motion.ts`

```ts
export const motion = { fast: 120, base: 180, slow: 260 } as const;

export const ease = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  emphasized: "cubic-bezier(0.4, 0, 0.2, 1)",
  linear: "linear",
} as const;
```

### `src/theme/breakpoints.ts`

```ts
export const breakpoints = { mobile: 0, tablet: 768, desktop: 1024 } as const;
export type Breakpoint = "mobile" | "tablet" | "desktop";
```

### `src/theme/index.ts` (modify existing)

Add re-exports:

```ts
export * from "./tokens";
export * from "./themes";
export * from "./typography";
export * from "./motion";
export * from "./breakpoints";
```

### `src/providers/ThemeProvider.tsx`

```tsx
interface Props { children: React.ReactNode; defaultTheme?: "dark" | "light"; }

export function ThemeProvider({ children, defaultTheme = "dark" }: Props) {
  return (
    <TamaguiProvider config={config} defaultTheme={defaultTheme}>
      <Theme name={defaultTheme}>{children}</Theme>
    </TamaguiProvider>
  );
}
```

### `src/theme/__tests__/theme.test.ts`

Smoke tests asserting:
- `motion.fast === 120`, `motion.base === 180`, `motion.slow === 260`.
- `breakpoints.tablet === 768`, `breakpoints.desktop === 1024`.
- Dark theme canvas is `#0a0a0a`, accent is `#30a8dc`.
- All token maps import without runtime error.

---

## Depends On

**PR 0001** — Tamagui and Reanimated packages installed.

## Done When

- `ThemeProvider` renders children without crash.
- `useTheme()` returns typed dark-theme tokens inside a test component.
- `motion`, `ease`, `breakpoints` importable from `@/theme`.
- `npx tsc --noEmit` passes.
- Smoke tests pass.
