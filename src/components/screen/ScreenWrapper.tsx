import React from "react";
import { StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentViewport, TopBar } from "@/components/shell";
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
 * TopBar + ScreenHeader (title, subtitle, loading spinner) + children with standard gap.
 *
 * This component includes ContentViewport (ScrollView + responsive padding),
 * then renders TopBar, ScreenHeader, and children.
 */
function ScreenWrapper({ headerProps, children, style }: ScreenWrapperProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, style]}>
      <TopBar />
      {headerProps && <ScreenHeader {...headerProps} />}
      <ContentViewport>
        {children}
      </ContentViewport>
    </SafeAreaView>
  );
}

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
});
