import React, { useMemo } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { ContentViewport, TopBar } from "@/components/shell";
import { FilterBar } from "@/components/filters";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { layout } from "@/theme/tokens";
import ScreenHeader from "./ScreenHeader";
import type { HeaderProps } from "./ScreenHeader";

interface ScreenWrapperProps {
  /** Props passed to ScreenHeader. If omitted, no header is rendered. */
  headerProps?: HeaderProps;
  children: ReactNode;
  /** Style applied to the outer container View */
  style?: StyleProp<ViewStyle>;
  /** Whether to show the sticky FilterBar above scroll content. Defaults to true. */
  showFilterBar?: boolean;
}

// Stable edge arrays — avoids recreating on every render
const EDGES_MOBILE: readonly Edge[] = ["top"];
const EDGES_DEFAULT: readonly Edge[] = ["top", "bottom"];

/**
 * Reusable screen wrapper that provides a consistent layout:
 * TopBar + ScreenHeader (title, subtitle, loading spinner) + children with standard gap.
 *
 * This component includes ContentViewport (ScrollView + responsive padding),
 * then renders TopBar, ScreenHeader, and children.
 */
const ScreenWrapper = React.memo(function ScreenWrapper({ headerProps, children, style, showFilterBar = true }: ScreenWrapperProps) {
  const bp = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const headerHorizontalPadding =
    bp === "desktop"
      ? layout.appHorizontalPadding.desktop
      : bp === "tablet"
        ? layout.appHorizontalPadding.tablet
        : layout.appHorizontalPadding.mobile;
  const safeAreaEdges = bp === "mobile" ? EDGES_MOBILE : EDGES_DEFAULT;

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.bg.canvas }, style],
    [theme.bg.canvas, style],
  );
  const headerContainerStyle = useMemo(
    () => [styles.headerContainer, { paddingHorizontal: headerHorizontalPadding }],
    [headerHorizontalPadding],
  );
  const filterBarContainerStyle = useMemo(
    () => [styles.filterBarContainer, { paddingHorizontal: headerHorizontalPadding }],
    [headerHorizontalPadding],
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={containerStyle}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.bg.canvas} />
      <TopBar />
      {headerProps && (
        <View style={headerContainerStyle}>
          <ScreenHeader {...headerProps} />
        </View>
      )}
      {showFilterBar && (
        <View testID="sticky-filter-bar" style={filterBarContainerStyle}>
          <FilterBar />
        </View>
      )}
      <ContentViewport>
        <View style={styles.content}>{children}</View>
      </ContentViewport>
    </SafeAreaView>
  );
});

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: layout.sectionGap,
  },
  content: {
    gap: layout.sectionGap,
    paddingBottom: layout.sectionGap,
  },
  headerContainer: {
    paddingTop: 2,
  },
  filterBarContainer: {
    paddingTop: 0,
  },
});
