import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Direct loading boolean -- shows spinner when true */
  isLoading?: boolean;
  /** Element rendered on the right side of the header row */
  rightComponent?: ReactNode;
}

const ScreenHeader = React.memo(function ScreenHeader({
  title,
  subtitle,
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
        {isLoading && (
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
});

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
    minHeight: 48,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[10],
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
  },
  right: {
    marginTop: spacing[4],
  },
  spinner: {
    marginLeft: spacing[4],
  },
});
