export type ThemeName = "dark" | "light";

export const fontFamilies = {
  sans: "Inter",
  mono: "Menlo"
} as const;

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 22,
  "3xl": 28
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700"
} as const;

export const spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  48: 48
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999
} as const;

export const borderWidth = {
  hairline: 1,
  strong: 2
} as const;

export interface ShadowToken {
  boxShadow: string;
  elevation: number;
}

export interface ThemeShadows {
  none: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
}

const transparentShadow: ShadowToken = {
  boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
  elevation: 0
};

export const shadowsByTheme: Record<ThemeName, ThemeShadows> = {
  dark: {
    none: transparentShadow,
    sm: {
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.2)",
      elevation: 1
    },
    md: {
      boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.24)",
      elevation: 3
    },
    lg: {
      boxShadow: "0px 8px 28px rgba(0, 0, 0, 0.28)",
      elevation: 6
    }
  },
  light: {
    none: transparentShadow,
    sm: {
      boxShadow: "0px 1px 4px rgba(15, 23, 32, 0.08)",
      elevation: 1
    },
    md: {
      boxShadow: "0px 4px 14px rgba(15, 23, 32, 0.12)",
      elevation: 3
    },
    lg: {
      boxShadow: "0px 8px 28px rgba(15, 23, 32, 0.16)",
      elevation: 6
    }
  }
};

export const layout = {
  appHorizontalPadding: {
    desktop: 24,
    tablet: 16,
    mobile: 12
  },
  cardPadding: {
    default: 16,
    denseDesktop: 20
  },
  gridGap: {
    desktop: 16,
    compact: 12
  },
  sectionGap: 24,
  kpiCardMinHeight: 132,
  topFilterBarHeight: 56,
  touchTargetMin: 44
} as const;
