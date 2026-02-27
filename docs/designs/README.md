# Figma -> AI Design Bridge

This folder contains a standalone TypeScript pipeline (separate from the React Native app) that:

1. Fetches Figma file JSON via REST API.
2. Saves raw JSON for reference.
3. Parses/cleans the payload into AI-friendly artifacts.

## Quick run

From repo root:

```bash
FIGMA_TOKEN="your_personal_access_token" npm run figma:sync
```

The script defaults to your shared Figma URL and extracts the file key automatically.

## Optional flags

```bash
FIGMA_TOKEN="..." npm run figma:sync -- --figma-url "https://www.figma.com/file/<fileKey>/..." --out "docs/designs/out"
```

Or pass `--file-key` directly:

```bash
FIGMA_TOKEN="..." npm run figma:sync -- --file-key "2LF4bYvYussXVBClE9OPp1"
```

## Output files

Generated in `docs/designs/out`:

- `figma.raw.json`: full source JSON from Figma.
- `figma.cleaned.json`: structured, reduced spec for AI ingestion.
- `figma.tokens.json`: extracted design tokens (colors/spacing/radius/typography).
- `figma.ui-spec.md`: markdown summary of hierarchy, components, and tokens.

## Implementation notes

- API layer uses interface abstraction: `IFigmaApi` -> `FigmaRestApi`.
- Shared TypeScript contracts are centralized in `src/types.ts` and reused across API + transform logic.
- No pixel export; output is focused on structure, layout intent, constraints, and tokens.
