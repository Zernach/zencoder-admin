import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAppDispatch } from "@/store";
import { setSidebarExpanded } from "@/store/slices/sidebarSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { SectionScrollProvider } from "@/hooks/useSectionScroll";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell = React.memo(function DashboardShell({ children }: DashboardShellProps) {
  const bp = useBreakpoint();
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isMobile = bp === "mobile";

  useEffect(() => {
    if (bp === "tablet") dispatch(setSidebarExpanded(false));
    if (bp === "desktop") dispatch(setSidebarExpanded(true));
  }, [bp, dispatch]);

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.bg.canvas }],
    [theme.bg.canvas],
  );

  return (
    <SectionScrollProvider>
      <View style={containerStyle}>
        {!isMobile && (
          <Sidebar />
        )}
        <View style={styles.main}>
          {children}
          {isMobile && <BottomTabs />}
        </View>
      </View>
    </SectionScrollProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
    position: "relative",
  },
});
