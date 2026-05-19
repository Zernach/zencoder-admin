import { shadowsByTheme, type ThemeName } from "./tokens";

export interface SemanticTheme {
  bg: {
    canvas: string;
    subtle: string;
    surface: string;
    surfaceElevated: string;
    surfaceHover: string;
    brandSubtle: string;
    overlay: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
    brand: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    brand: string;
    onBrand: string;
  };
  icon: {
    primary: string;
    secondary: string;
  };
  state: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  data: {
    gridLine: string;
    seriesPrimary: string;
    seriesSecondary: string;
    seriesTertiary: string;
  };
  shadows: (typeof shadowsByTheme)[ThemeName];
}

export const semanticThemes: Record<ThemeName, Omit<SemanticTheme, "shadows">> = {
  dark: {
    bg: {
      canvas: "#0a0a0a",
      subtle: "#121212",
      surface: "#1a1a1a",
      surfaceElevated: "#262626",
      surfaceHover: "#2f2f2f",
      brandSubtle: "rgba(193, 59, 91, 0.28)",
      overlay: "rgba(0, 0, 0, 0.58)"
    },
    border: {
      default: "#2d2d2d",
      subtle: "#242424",
      strong: "#3a3a3a",
      brand: "#C13B5B"
    },
    text: {
      primary: "#e5e5e5",
      secondary: "#a3a3a3",
      tertiary: "#8a8a8a",
      brand: "#C13B5B",
      onBrand: "#ffffff"
    },
    icon: {
      primary: "#dcdcdc",
      secondary: "#9b9b9b"
    },
    state: {
      success: "#00ca51",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#38bdf8"
    },
    data: {
      gridLine: "#2a2a2a",
      seriesPrimary: "#9B2FB5",
      seriesSecondary: "#C13B5B",
      seriesTertiary: "#E0739A"
    }
  },
  light: {
    bg: {
      canvas: "#f6f7f8",
      subtle: "#eef1f4",
      surface: "#ffffff",
      surfaceElevated: "#fbfdff",
      surfaceHover: "#f3f6f9",
      brandSubtle: "rgba(142, 44, 72, 0.22)",
      overlay: "rgba(15, 23, 32, 0.38)"
    },
    border: {
      default: "#d7dde3",
      subtle: "#e4e8ec",
      strong: "#c5ced8",
      brand: "#C13B5B"
    },
    text: {
      primary: "#0f1720",
      secondary: "#435160",
      tertiary: "#6b7683",
      brand: "#8E2C48",
      onBrand: "#ffffff"
    },
    icon: {
      primary: "#1f2c39",
      secondary: "#5a6877"
    },
    state: {
      success: "#00ca51",
      warning: "#a16207",
      error: "#b91c1c",
      info: "#0369a1"
    },
    data: {
      gridLine: "#e3e7eb",
      seriesPrimary: "#9B2FB5",
      seriesSecondary: "#C13B5B",
      seriesTertiary: "#E0739A"
    }
  }
};

export function buildTheme(themeName: ThemeName): SemanticTheme {
  return {
    ...semanticThemes[themeName],
    shadows: shadowsByTheme[themeName]
  };
}
