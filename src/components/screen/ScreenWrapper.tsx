import React, { useMemo } from "react";
import { View, StatusBar, StyleSheet, Platform } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { ContentViewport, TopBar } from "@/components/shell";
import type { TopBarProps } from "@/components/shell/TopBar";
import { FilterBar } from "@/components/filters";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { layout, spacing } from "@/theme/tokens";
import ScreenHeader from "./ScreenHeader";
import type { HeaderProps } from "./ScreenHeader";

interface ScreenWrapperProps {
  /** Props passed to ScreenHeader. If omitted, no header is rendered. */
  headerProps?: HeaderProps;
  children: ReactNode;
  /** Optional custom top filter-bar content rendered below header/subtitle. */
  topFilterBar?: ReactNode;
  /** Optional non-scrolling content fixed below the scroll viewport (e.g. composer). */
  bottomAccessory?: ReactNode;
  /** Style applied to the outer container View */
  style?: StyleProp<ViewStyle>;
  /** Whether to show the sticky FilterBar above scroll content. Defaults to true. */
  showFilterBar?: boolean;
  /** Whether to show the TopBar (search + time-range). Defaults to true. */
  showTopBar?: boolean;
  /** Props forwarded to TopBar when visible. */
  topBarProps?: TopBarProps;
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
const ScreenWrapper = React.memo(function ScreenWrapper({
  headerProps,
  children,
  topFilterBar,
  bottomAccessory,
  style,
  showFilterBar = true,
  showTopBar = true,
  topBarProps,
}: ScreenWrapperProps) {
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
    () => [
      styles.headerContainer,
      showTopBar ? styles.headerContainerWithTopBar : styles.headerContainerStandalone,
      { paddingHorizontal: headerHorizontalPadding },
    ],
    [headerHorizontalPadding, showTopBar],
  );
  const filterBarContainerStyle = useMemo(
    () => [styles.filterBarContainer, { paddingHorizontal: headerHorizontalPadding }],
    [headerHorizontalPadding],
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={containerStyle}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.bg.canvas} />
      {showTopBar && <TopBar {...topBarProps} />}
      {headerProps && (
        <View style={headerContainerStyle}>
          <ScreenHeader {...headerProps} />
        </View>
      )}
      {(showFilterBar || topFilterBar) && (
        <View testID="sticky-filter-bar" style={filterBarContainerStyle}>
          {topFilterBar ?? <FilterBar />}
        </View>
      )}
      <ContentViewport>
        <View style={styles.content}>{children}</View>
      </ContentViewport>
      {bottomAccessory ? (
        <View style={styles.bottomAccessory}>{bottomAccessory}</View>
      ) : null}
    </SafeAreaView>
  );
});

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing[16],
  },
  content: {
    gap: layout.sectionGap,
    paddingBottom: layout.sectionGap,
  },
  headerContainer: {
    paddingTop: spacing[2],
    paddingBottom: spacing[12],
  },
  headerContainerWithTopBar: {
    paddingTop: Platform.OS === "web" ? spacing[4] : spacing[2],
  },
  headerContainerStandalone: {
    paddingTop: Platform.OS === "web" ? spacing[16] : spacing[12],
  },
  filterBarContainer: {
    paddingTop: spacing[0],
  },
  bottomAccessory: {
    flexShrink: 0,
  },
});
