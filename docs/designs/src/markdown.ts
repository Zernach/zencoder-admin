import type { CleanedDesignSpec } from "./types.ts";

function renderTokenMap(tokens: Record<string, string>): string {
  if (Object.keys(tokens).length === 0) {
    return "- none";
  }

  return Object.entries(tokens)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

export function toMarkdown(spec: CleanedDesignSpec): string {
  const header = [
    `# UI Spec: ${spec.source.fileName}`,
    "",
    `- File key: ${spec.source.fileKey}`,
    `- Fetched at: ${spec.source.fetchedAt}`,
    `- Last modified: ${spec.source.lastModified}`,
    ""
  ].join("\n");

  const summary = [
    "## Summary",
    "",
    `- Total nodes: ${spec.summary.totalNodes}`,
    `- Screens: ${spec.summary.screens}`,
    `- Components: ${spec.summary.components}`,
    `- Text nodes: ${spec.summary.textNodes}`,
    ""
  ].join("\n");

  const screens = [
    "## Screens",
    "",
    ...spec.screens.map((screen) =>
      [
        `### ${screen.name}`,
        `- id: ${screen.id}`,
        `- size: ${screen.width ?? "?"}x${screen.height ?? "?"}`,
        `- layout: ${screen.layoutMode}`,
        `- item spacing: ${screen.itemSpacing ?? "n/a"}`,
        `- padding: top ${screen.padding.top ?? "n/a"}, right ${screen.padding.right ?? "n/a"}, bottom ${screen.padding.bottom ?? "n/a"}, left ${screen.padding.left ?? "n/a"}`,
        `- child count: ${screen.childCount}`
      ].join("\n")
    ),
    ""
  ].join("\n");

  const components = [
    "## Components",
    "",
    ...spec.components.slice(0, 200).map((component) =>
      [
        `### ${component.name}`,
        `- id: ${component.id}`,
        `- type: ${component.type}`,
        `- layout: ${component.layoutMode}`,
        `- variants: ${component.variants.length > 0 ? component.variants.join(" | ") : "none"}`
      ].join("\n")
    ),
    ""
  ].join("\n");

  const tokens = [
    "## Tokens",
    "",
    "### Colors",
    renderTokenMap(spec.tokens.colors),
    "",
    "### Spacing",
    spec.tokens.spacing.length > 0 ? `- ${spec.tokens.spacing.join(", ")}` : "- none",
    "",
    "### Radius",
    spec.tokens.radius.length > 0 ? `- ${spec.tokens.radius.join(", ")}` : "- none",
    "",
    "### Typography",
    Object.keys(spec.tokens.typography).length > 0
      ? Object.entries(spec.tokens.typography)
          .map(
            ([name, type]) =>
              `- ${name}: ${type.fontFamily ?? "unknown"}, ${type.fontWeight ?? "?"}, ${type.fontSize ?? "?"}px`
          )
          .join("\n")
      : "- none",
    ""
  ].join("\n");

  const text = [
    "## Key Text",
    "",
    ...spec.keyText.slice(0, 200).map((item) => `- ${item.name}: ${item.text}`),
    ""
  ].join("\n");

  return `${header}${summary}${screens}${components}${tokens}${text}`;
}
