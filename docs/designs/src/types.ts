export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaPaint {
  type: string;
  visible?: boolean;
  color?: FigmaColor;
  opacity?: number;
}

export interface FigmaTypeStyle {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textCase?: string;
  textDecoration?: string;
}

export interface FigmaAbsoluteBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaConstraint {
  vertical?: string;
  horizontal?: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  characters?: string;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  itemSpacing?: number;
  layoutWrap?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  constraints?: FigmaConstraint;
  absoluteBoundingBox?: FigmaAbsoluteBoundingBox;
  style?: FigmaTypeStyle;
}

export interface FigmaFileResponse {
  name: string;
  version: string;
  lastModified: string;
  document: FigmaNode;
}

export interface ExtractedScreen {
  id: string;
  name: string;
  width: number | null;
  height: number | null;
  layoutMode: string;
  itemSpacing: number | null;
  padding: {
    top: number | null;
    right: number | null;
    bottom: number | null;
    left: number | null;
  };
  childCount: number;
}

export interface ExtractedComponent {
  id: string;
  name: string;
  type: string;
  layoutMode: string;
  variants: string[];
}

export interface DesignTokenSet {
  colors: Record<string, string>;
  typography: Record<string, {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  }>;
  spacing: number[];
  radius: number[];
}

export interface CleanedDesignSpec {
  source: {
    fileName: string;
    fileKey: string;
    fetchedAt: string;
    lastModified: string;
  };
  summary: {
    totalNodes: number;
    screens: number;
    components: number;
    textNodes: number;
  };
  screens: ExtractedScreen[];
  components: ExtractedComponent[];
  keyText: Array<{ id: string; name: string; text: string }>;
  tokens: DesignTokenSet;
}
