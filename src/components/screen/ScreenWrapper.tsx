import React from "react";
import { View, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import ScreenHeader from "./ScreenHeader";
import type { HeaderProps } from "./ScreenHeader";

interface ScreenWrapperProps {
  /** Props passed to ScreenHeader. If omitted, no header is rendered. */
  headerProps?: HeaderProps;
  children: ReactNode;
  /** Style applied to the outer container View */
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable screen wrapper that provides a consistent layout:
 * ScreenHeader (title, subtitle, loading spinner) + children with standard gap.
 *
 * This component lives inside the DashboardShell's ContentViewport,
 * which already provides ScrollView and responsive padding.
 */
function ScreenWrapper({ headerProps, children, style }: ScreenWrapperProps) {
  return (
    <View style={[styles.container, style]}>
      {headerProps && <ScreenHeader {...headerProps} />}
      {children}
    </View>
  );
}

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});
