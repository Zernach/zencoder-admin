import type {
  CleanedDesignSpec,
  DesignTokenSet,
  ExtractedComponent,
  ExtractedScreen,
  FigmaColor,
  FigmaFileResponse,
  FigmaNode,
  FigmaPaint,
  FigmaTypeStyle
} from "./types.ts";

interface BuildContext {
  totalNodes: number;
  textNodes: number;
  screens: ExtractedScreen[];
  components: ExtractedComponent[];
  keyText: Array<{ id: string; name: string; text: string }>;
  colorSet: Set<string>;
  spacingSet: Set<number>;
  radiusSet: Set<number>;
  typographyMap: Map<string, DesignTokenSet["typography"][string]>;
}

function normalizeColor(color: FigmaColor, opacity?: number): string {
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);
  const alpha = opacity ?? color.a ?? 1;

  if (alpha >= 1) {
    return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`.toUpperCase();
  }

  const alphaByte = Math.round(alpha * 255);
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}${alphaByte.toString(16).padStart(2, "0")}`.toUpperCase();
}

function collectPaintColors(paints: FigmaPaint[] | undefined, context: BuildContext): void {
  if (!paints) {
    return;
  }

  for (const paint of paints) {
    if (paint.visible === false || paint.type !== "SOLID" || !paint.color) {
      continue;
    }

    context.colorSet.add(normalizeColor(paint.color, paint.opacity));
  }
}

function collectTypography(style: FigmaTypeStyle | undefined, context: BuildContext): void {
  if (!style || !style.fontFamily || !style.fontSize) {
    return;
  }

  const key = `${style.fontFamily}-${style.fontWeight ?? 400}-${style.fontSize}`;
  context.typographyMap.set(key, {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontSize: style.fontSize,
    lineHeightPx: style.lineHeightPx,
    letterSpacing: style.letterSpacing
  });
}

function collectSpacingAndRadius(node: FigmaNode, context: BuildContext): void {
  const spacingCandidates = [
    node.itemSpacing,
    node.paddingTop,
    node.paddingRight,
    node.paddingBottom,
    node.paddingLeft
  ];

  for (const candidate of spacingCandidates) {
    if (typeof candidate === "number" && candidate >= 0) {
      context.spacingSet.add(candidate);
    }
  }

  if (typeof node.cornerRadius === "number" && node.cornerRadius >= 0) {
    context.radiusSet.add(node.cornerRadius);
  }
}

function createScreen(node: FigmaNode): ExtractedScreen {
  return {
    id: node.id,
    name: node.name,
    width: node.absoluteBoundingBox?.width ?? null,
    height: node.absoluteBoundingBox?.height ?? null,
    layoutMode: node.layoutMode ?? "NONE",
    itemSpacing: node.itemSpacing ?? null,
    padding: {
      top: node.paddingTop ?? null,
      right: node.paddingRight ?? null,
      bottom: node.paddingBottom ?? null,
      left: node.paddingLeft ?? null
    },
    childCount: node.children?.length ?? 0
  };
}

function createComponent(node: FigmaNode): ExtractedComponent {
  const variants = node.name.includes(",") ? node.name.split(",").map((part) => part.trim()) : [];

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    layoutMode: node.layoutMode ?? "NONE",
    variants
  };
}

function walk(node: FigmaNode, context: BuildContext, depth: number): void {
  context.totalNodes += 1;

  collectPaintColors(node.fills, context);
  collectPaintColors(node.strokes, context);
  collectTypography(node.style, context);
  collectSpacingAndRadius(node, context);

  if ((node.type === "FRAME" || node.type === "SECTION") && depth <= 2) {
    context.screens.push(createScreen(node));
  }

  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
    context.components.push(createComponent(node));
  }

  if (node.type === "TEXT" && node.characters) {
    context.textNodes += 1;

    const text = node.characters.trim();
    if (text.length > 0 && context.keyText.length < 200) {
      context.keyText.push({ id: node.id, name: node.name, text });
    }
  }

  for (const child of node.children ?? []) {
    walk(child, context, depth + 1);
  }
}

function buildTokens(context: BuildContext): DesignTokenSet {
  const colors = Array.from(context.colorSet).sort();
  const spacing = Array.from(context.spacingSet).sort((left, right) => left - right);
  const radius = Array.from(context.radiusSet).sort((left, right) => left - right);

  const colorTokens: Record<string, string> = {};
  colors.forEach((value, index) => {
    colorTokens[`color${String(index + 1).padStart(2, "0")}`] = value;
  });

  const typography: DesignTokenSet["typography"] = {};
  let index = 1;
  for (const value of context.typographyMap.values()) {
    typography[`type${String(index).padStart(2, "0")}`] = value;
    index += 1;
  }

  return {
    colors: colorTokens,
    typography,
    spacing,
    radius
  };
}

export function buildCleanedSpec(fileKey: string, figma: FigmaFileResponse): CleanedDesignSpec {
  const context: BuildContext = {
    totalNodes: 0,
    textNodes: 0,
    screens: [],
    components: [],
    keyText: [],
    colorSet: new Set<string>(),
    spacingSet: new Set<number>(),
    radiusSet: new Set<number>(),
    typographyMap: new Map<string, DesignTokenSet["typography"][string]>()
  };

  walk(figma.document, context, 0);

  return {
    source: {
      fileName: figma.name,
      fileKey,
      fetchedAt: new Date().toISOString(),
      lastModified: figma.lastModified
    },
    summary: {
      totalNodes: context.totalNodes,
      screens: context.screens.length,
      components: context.components.length,
      textNodes: context.textNodes
    },
    screens: context.screens,
    components: context.components,
    keyText: context.keyText,
    tokens: buildTokens(context)
  };
}
