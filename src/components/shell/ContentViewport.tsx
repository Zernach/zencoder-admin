import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface ContentViewportProps {
  children: React.ReactNode;
}

export function ContentViewport({ children }: ContentViewportProps) {
  const bp = useBreakpoint();
  const padding =
    bp === "desktop" ? 24 : bp === "tablet" ? 16 : 12;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { padding }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    flexGrow: 1,
  },
});
