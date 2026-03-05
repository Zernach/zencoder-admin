import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Slash,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react-native";
import type { RunStatus, Severity } from "@/features/analytics/types";

interface StatusConfigEntry { color: string; Icon: React.ElementType; label: string; }

interface StatusBadgeProps {
  variant: "run-status" | "severity";
  status?: RunStatus;
  severity?: Severity;
}

const STATUS_CONFIG: Record<RunStatus, StatusConfigEntry> = {
  succeeded: { color: "#22c55e", Icon: CheckCircle, label: "Success" },
  failed: { color: "#ef4444", Icon: XCircle, label: "Failed" },
  running: { color: "#38bdf8", Icon: Play, label: "Running" },
  queued: { color: "#a3a3a3", Icon: Clock, label: "Queued" },
  canceled: { color: "#8a8a8a", Icon: Slash, label: "Canceled" },
};

const SEVERITY_CONFIG: Record<Severity, StatusConfigEntry> = {
  HIGH: { color: "#ef4444", Icon: AlertTriangle, label: "HIGH" },
  MEDIUM: { color: "#f59e0b", Icon: AlertCircle, label: "MEDIUM" },
  LOW: { color: "#a3a3a3", Icon: Info, label: "LOW" },
};

export function StatusBadge({ variant, status, severity }: StatusBadgeProps) {
  const config =
    variant === "run-status" && status
      ? STATUS_CONFIG[status]
      : variant === "severity" && severity
        ? SEVERITY_CONFIG[severity]
        : null;

  if (!config) return null;

  const { color, Icon, label } = config;

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
      <Icon size={12} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
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
