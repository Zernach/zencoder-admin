import React from "react";
import { View, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useSidebarState } from "@/hooks/useSidebarState";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { ContentViewport } from "./ContentViewport";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const bp = useBreakpoint();
  const sidebar = useSidebarState();
  const isMobile = bp === "mobile";

  return (
    <View style={styles.container}>
      {!isMobile && (
        <Sidebar expanded={sidebar.expanded} onToggle={sidebar.toggle} />
      )}
      <View style={styles.main}>
        <TopBar
          onToggleSidebar={sidebar.toggle}
          showMenuButton={!isMobile}
        />
        <ContentViewport>{children}</ContentViewport>
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
