import { fontFamilies, fontSizes, fontWeights, lineHeights } from "./tokens";

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: keyof typeof fontWeights;
  lineHeight: number;
  letterSpacing?: number;
}

const toLineHeightPx = (fontSize: number, lineHeightToken: keyof typeof lineHeights): number => {
  return Math.round(fontSize * lineHeights[lineHeightToken]);
};

export const typography = {
  pageTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes["2xl"],
    fontWeight: "bold",
    lineHeight: toLineHeightPx(fontSizes["2xl"], "tight"),
    letterSpacing: -0.2
  },
  sectionTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xl,
    fontWeight: "semibold",
    lineHeight: toLineHeightPx(fontSizes.xl, "tight")
  },
  cardTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: "semibold",
    lineHeight: toLineHeightPx(fontSizes.md, "normal")
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: "regular",
    lineHeight: toLineHeightPx(fontSizes.md, "normal")
  },
  tableBody: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: "regular",
    lineHeight: toLineHeightPx(fontSizes.sm, "normal")
  },
  label: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: "medium",
    lineHeight: toLineHeightPx(fontSizes.xs, "normal")
  },
  kpiValueDesktop: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes["3xl"],
    fontWeight: "bold",
    lineHeight: toLineHeightPx(fontSizes["3xl"], "tight"),
    letterSpacing: -0.3
  },
  kpiValueMobile: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes["2xl"],
    fontWeight: "bold",
    lineHeight: toLineHeightPx(fontSizes["2xl"], "tight"),
    letterSpacing: -0.2
  },
  codeValue: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: "semibold",
    lineHeight: toLineHeightPx(fontSizes.sm, "normal")
  }
} as const satisfies Record<string, TextStyleToken>;

export function resolveFontWeight(weight: keyof typeof fontWeights): string {
  return fontWeights[weight];
}
