import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { ChartCardHeaderActionContext } from "./ChartCardHeaderActionContext";

const NOOP = () => {};

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const ChartCard = React.memo(function ChartCard({
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
  const [headerAction, setHeaderAction] = useState<React.ReactNode>(null);
  const headerActionContext = useMemo(() => ({ setHeaderAction }), []);

  const cardStyle = useMemo(() => [
    styles.card,
    style,
    {
      borderColor: theme.border.subtle,
      backgroundColor: theme.bg.surface,
    },
  ], [style, theme.border.subtle, theme.bg.surface]);

  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextWrap}>
            {title && <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>}
          </View>
          {headerAction ? <View style={styles.headerActionWrap}>{headerAction}</View> : null}
        </View>
      </View>
      <ChartCardHeaderActionContext.Provider value={headerActionContext}>
        {loading ? (
          <LoadingSkeleton variant="chart" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry ?? NOOP} />
        ) : (
          children
        )}
      </ChartCardHeaderActionContext.Provider>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[16],
  },
  header: {
    marginBottom: spacing[12],
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing[8],
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerActionWrap: {
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: spacing[2],
  },
});
