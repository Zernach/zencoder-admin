import React from "react";
import { TamaguiProvider, Theme } from "@tamagui/core";
import config from "../../tamagui.config";

interface Props {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light";
}

export function ThemeProvider({ children, defaultTheme = "dark" }: Props) {
  return (
    <TamaguiProvider config={config} defaultTheme={defaultTheme}>
      <Theme name={defaultTheme}>{children}</Theme>
    </TamaguiProvider>
  );
}
