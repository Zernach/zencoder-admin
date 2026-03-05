import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ContentViewportProps {
  children: React.ReactNode;
}

export function ContentViewport({ children }: ContentViewportProps) {
  const bp = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const padding =
    bp === "desktop" ? 24 : bp === "tablet" ? 16 : 12;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg.canvas }]}
      contentContainerStyle={[styles.content, { padding }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
