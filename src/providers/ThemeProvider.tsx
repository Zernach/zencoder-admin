import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type AppThemeMode = "dark" | "light";

interface ThemeContextValue {
  mode: AppThemeMode;
  setMode: (nextMode: AppThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeContextValue | null>(null);

interface Props {
  children: ReactNode;
  defaultTheme?: AppThemeMode;
}

export function ThemeProvider({ children, defaultTheme = "dark" }: Props) {
  const [mode, setMode] = useState<AppThemeMode>(defaultTheme);

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeModeContext);

  if (context === null) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}
