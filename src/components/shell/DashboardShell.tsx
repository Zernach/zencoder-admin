import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSidebarExpanded, toggleSidebar, selectSidebarExpanded } from "@/store/slices/sidebarSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { SectionScrollProvider } from "@/hooks/useSectionScroll";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const bp = useBreakpoint();
  const dispatch = useAppDispatch();
  const expanded = useAppSelector(selectSidebarExpanded);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isMobile = bp === "mobile";

  useEffect(() => {
    if (bp === "tablet") dispatch(setSidebarExpanded(false));
    if (bp === "desktop") dispatch(setSidebarExpanded(true));
  }, [bp, dispatch]);

  return (
    <SectionScrollProvider>
      <View style={[styles.container, { backgroundColor: theme.bg.canvas }]}>
        {!isMobile && (
          <Sidebar
            expanded={expanded}
            onToggle={() => dispatch(toggleSidebar())}
          />
        )}
        <View style={styles.main}>
          {children}
          {isMobile && <BottomTabs />}
        </View>
      </View>
    </SectionScrollProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
  },
});
