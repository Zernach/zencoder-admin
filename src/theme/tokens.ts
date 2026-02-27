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
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999
} as const;

export const borderWidth = {
  hairline: 1,
  strong: 2
} as const;

export interface ShadowToken {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: {
    width: number;
    height: number;
  };
  elevation: number;
}

export interface ThemeShadows {
  none: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
}

const transparentShadow: ShadowToken = {
  shadowColor: "#000000",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0
};

export const shadowsByTheme: Record<ThemeName, ThemeShadows> = {
  dark: {
    none: transparentShadow,
    sm: {
      shadowColor: "#000000",
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1
    },
    md: {
      shadowColor: "#000000",
      shadowOpacity: 0.24,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3
    },
    lg: {
      shadowColor: "#000000",
      shadowOpacity: 0.28,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6
    }
  },
  light: {
    none: transparentShadow,
    sm: {
      shadowColor: "#0f1720",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1
    },
    md: {
      shadowColor: "#0f1720",
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3
    },
    lg: {
      shadowColor: "#0f1720",
      shadowOpacity: 0.16,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 8 },
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
