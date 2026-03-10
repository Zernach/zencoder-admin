import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  CheckCircle,
  XCircle,
  Clock,
  Slash,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react-native";
import { spacing, radius } from "@/theme/tokens";
import type { RunStatus, Severity } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { CustomSpinner } from "@/components/feedback";

interface StatusConfigEntry {
  color: string;
  label: string;
  Icon?: React.ElementType;
  showSpinner?: boolean;
}

interface StatusBadgeProps {
  variant: "run-status" | "severity";
  status?: RunStatus;
  severity?: Severity;
}

export const StatusBadge = React.memo(function StatusBadge({ variant, status, severity }: StatusBadgeProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const config = useMemo(() => {
    const STATUS_CONFIG: Record<RunStatus, StatusConfigEntry> = {
      succeeded: { color: theme.state.success, Icon: CheckCircle, label: "Success" },
      failed: { color: theme.state.error, Icon: XCircle, label: "Failed" },
      running: { color: theme.state.warning, label: "Running", showSpinner: true },
      queued: { color: theme.text.secondary, Icon: Clock, label: "Queued" },
      canceled: { color: theme.text.tertiary, Icon: Slash, label: "Canceled" },
    };

    const SEVERITY_CONFIG: Record<Severity, StatusConfigEntry> = {
      HIGH: { color: theme.state.error, Icon: AlertTriangle, label: "HIGH" },
      MEDIUM: { color: theme.state.warning, Icon: AlertCircle, label: "MEDIUM" },
      LOW: { color: theme.text.secondary, Icon: Info, label: "LOW" },
    };

    return variant === "run-status" && status
      ? STATUS_CONFIG[status]
      : variant === "severity" && severity
        ? SEVERITY_CONFIG[severity]
        : null;
  }, [variant, status, severity, mode]);

  if (!config) return null;

  const { color, Icon, label, showSpinner } = config;

  return (
    <View
      style={[
        styles.badge,
        variant === "run-status" && styles.runStatusBadge,
        variant === "severity" && styles.severityBadge,
        { borderColor: color },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      {showSpinner ? (
        <CustomSpinner size={12} strokeWidth={1.8} color={color} trackColor={theme.data.gridLine} />
      ) : Icon ? (
        <Icon size={12} color={color} />
      ) : null}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  runStatusBadge: {
    width: 88,
    justifyContent: "center",
  },
  severityBadge: {
    width: 88,
    justifyContent: "center",
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
