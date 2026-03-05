import React, { useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ContentViewport, TopBar } from "@/components/shell";
import { FilterBar } from "@/components/filters";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { motion } from "@/theme/motion";
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

/**
 * Reusable screen wrapper that provides a consistent layout:
 * TopBar + ScreenHeader (title, subtitle, loading spinner) + children with standard gap.
 *
 * This component includes ContentViewport (ScrollView + responsive padding),
 * then renders TopBar, ScreenHeader, and children.
 */
function ScreenWrapper({ headerProps, children, style, showFilterBar = true }: ScreenWrapperProps) {
  const pathname = usePathname();
  const bp = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const headerHorizontalPadding =
    bp === "desktop"
      ? layout.appHorizontalPadding.desktop
      : bp === "tablet"
        ? layout.appHorizontalPadding.tablet
        : layout.appHorizontalPadding.mobile;

  useEffect(() => {
    if (reducedMotion || bp === "mobile") return;
    opacity.value = 0.8;
    translateY.value = 8;
    opacity.value = withTiming(1, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
  }, [pathname, reducedMotion, bp, opacity, translateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.bg.canvas }, style]}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.bg.canvas} />
      <TopBar />
      {headerProps && (
        <View style={[styles.headerContainer, { paddingHorizontal: headerHorizontalPadding }]}>
          <ScreenHeader {...headerProps} />
        </View>
      )}
      {showFilterBar && (
        <View testID="sticky-filter-bar" style={[styles.filterBarContainer, { paddingHorizontal: headerHorizontalPadding }]}>
          <FilterBar />
        </View>
      )}
      <ContentViewport>
        <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
      </ContentViewport>
    </SafeAreaView>
  );
}

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
