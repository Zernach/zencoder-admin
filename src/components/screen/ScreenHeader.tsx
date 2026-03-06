import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import ReduxLoadingSpinner from "./ReduxLoadingSpinner";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Redux loading key -- shows spinner when state.loading[key] is true */
  isLoadingReduxKey?: string;
  /** Direct loading boolean -- shows spinner when true */
  isLoading?: boolean;
  /** Element rendered on the right side of the header row */
  rightComponent?: ReactNode;
}

function ScreenHeader({
  title,
  subtitle,
  isLoadingReduxKey,
  isLoading,
  rightComponent,
}: HeaderProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {isLoadingReduxKey != null && (
          <ReduxLoadingSpinner
            reduxKey={isLoadingReduxKey}
            size="small"
            style={styles.spinner}
          />
        )}
        {isLoading && isLoadingReduxKey == null && (
          <ActivityIndicator
            size="small"
            color={theme.border.brand}
            style={styles.spinner}
            accessibilityLabel="Loading"
          />
        )}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.text.secondary }]} numberOfLines={1} ellipsizeMode="tail">
          {subtitle}
        </Text>
      )}
      {rightComponent != null && (
        <View style={styles.right}>{rightComponent}</View>
      )}
    </View>
  );
}

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    gap: 4,
    minHeight: 48,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  right: {
    marginTop: 4,
  },
  spinner: {
    marginLeft: 4,
  },
});
