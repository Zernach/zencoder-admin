import React, { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { useSectionScroll } from "@/hooks/useSectionScroll";

interface ContentViewportProps {
  children: React.ReactNode;
}

export function ContentViewport({ children }: ContentViewportProps) {
  const bp = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { registerScrollView } = useSectionScroll();
  const padding =
    bp === "desktop" ? 24 : bp === "tablet" ? 16 : 12;

  const scrollRef = useCallback(
    (ref: ScrollView | null) => {
      registerScrollView(ref);
    },
    [registerScrollView],
  );

  return (
    <ScrollView
      ref={scrollRef}
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
