import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  loading,
  error,
  onRetry,
  style,
  children,
}: ChartCardProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View
      style={[
        styles.card,
        style,
        {
          borderColor: theme.border.subtle,
          backgroundColor: theme.bg.surface,
        },
      ]}
    >
      <View style={styles.header}>
        {title && <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>}
        {subtitle && <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>}
      </View>
      {loading ? (
        <LoadingSkeleton variant="chart" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry ?? (() => { })} />
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
