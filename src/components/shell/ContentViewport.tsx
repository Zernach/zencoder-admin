import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { CustomList, type CustomListRef } from "@/components/lists";
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

  const scrollRef = useCallback((ref: CustomListRef | null) => {
    if (ref && typeof ref.scrollTo === "function") {
      registerScrollView(ref as { scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void });
      return;
    }
    registerScrollView(null);
  }, [registerScrollView]);

  return (
    <CustomList
      ref={scrollRef}
      scrollViewProps={{
        style: [styles.container, { backgroundColor: theme.bg.canvas }],
        contentContainerStyle: [styles.content, { padding }],
      }}
    >
      {children}
    </CustomList>
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
