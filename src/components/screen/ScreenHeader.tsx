import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import ReduxLoadingSpinner from "./ReduxLoadingSpinner";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Redux loading key — shows spinner when state.loading[key] is true */
  isLoadingReduxKey?: string;
  /** Direct loading boolean — shows spinner when true */
  isLoading?: boolean;
  /** Element rendered on the right side of the header row */
  rightComponent?: ReactNode;
}

/**
 * Reusable header component for screens.
 * Shows a spinner when isLoading is true or when the Redux loading key is active.
 */
function ScreenHeader({
  title,
  subtitle,
  isLoadingReduxKey,
  isLoading,
  rightComponent,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
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
            color="#30a8dc"
            style={styles.spinner}
            accessibilityLabel="Loading"
          />
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e5e5e5",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#a3a3a3",
  },
  right: {
    marginTop: 4,
  },
  spinner: {
    marginLeft: 4,
  },
});
