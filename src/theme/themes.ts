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
      brandSubtle: "rgba(48, 168, 220, 0.14)",
      overlay: "rgba(0, 0, 0, 0.58)"
    },
    border: {
      default: "#2d2d2d",
      subtle: "#242424",
      strong: "#3a3a3a",
      brand: "#30a8dc"
    },
    text: {
      primary: "#e5e5e5",
      secondary: "#a3a3a3",
      tertiary: "#8a8a8a",
      brand: "#67c4ea",
      onBrand: "#00131c"
    },
    icon: {
      primary: "#dcdcdc",
      secondary: "#9b9b9b"
    },
    state: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#38bdf8"
    },
    data: {
      gridLine: "#2a2a2a",
      seriesPrimary: "#30a8dc",
      seriesSecondary: "#7fa6b8",
      seriesTertiary: "#a855f7"
    }
  },
  light: {
    bg: {
      canvas: "#f6f7f8",
      subtle: "#eef1f4",
      surface: "#ffffff",
      surfaceElevated: "#fbfdff",
      surfaceHover: "#f3f6f9",
      brandSubtle: "rgba(48, 168, 220, 0.12)",
      overlay: "rgba(15, 23, 32, 0.38)"
    },
    border: {
      default: "#d7dde3",
      subtle: "#e4e8ec",
      strong: "#c5ced8",
      brand: "#2b9fce"
    },
    text: {
      primary: "#0f1720",
      secondary: "#435160",
      tertiary: "#6b7683",
      brand: "#0f7ea9",
      onBrand: "#ffffff"
    },
    icon: {
      primary: "#1f2c39",
      secondary: "#5a6877"
    },
    state: {
      success: "#16803d",
      warning: "#a16207",
      error: "#b91c1c",
      info: "#0369a1"
    },
    data: {
      gridLine: "#e3e7eb",
      seriesPrimary: "#30a8dc",
      seriesSecondary: "#6f8ca5",
      seriesTertiary: "#7c3aed"
    }
  }
};

export function buildTheme(themeName: ThemeName): SemanticTheme {
  return {
    ...semanticThemes[themeName],
    shadows: shadowsByTheme[themeName]
  };
}
