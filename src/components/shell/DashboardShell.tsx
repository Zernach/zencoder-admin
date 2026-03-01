import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSidebarExpanded, toggleSidebar } from "@/store/slices/sidebarSlice";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const bp = useBreakpoint();
  const dispatch = useAppDispatch();
  const expanded = useAppSelector((state) => state.sidebar.expanded);
  const isMobile = bp === "mobile";

  useEffect(() => {
    if (bp === "tablet") dispatch(setSidebarExpanded(false));
    if (bp === "desktop") dispatch(setSidebarExpanded(true));
  }, [bp, dispatch]);

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
  },
  main: {
    flex: 1,
  },
});
