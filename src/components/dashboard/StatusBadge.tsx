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
import type { RunStatus } from "@/features/analytics/types";

interface StatusBadgeProps {
  variant: "run-status" | "severity";
  status?: RunStatus;
  severity?: "HIGH" | "MEDIUM" | "LOW";
}

const STATUS_CONFIG: Record<
  RunStatus,
  { color: string; Icon: React.ElementType; label: string }
> = {
  succeeded: { color: "#22c55e", Icon: CheckCircle, label: "Success" },
  failed: { color: "#ef4444", Icon: XCircle, label: "Failed" },
  running: { color: "#38bdf8", Icon: Play, label: "Running" },
  queued: { color: "#a3a3a3", Icon: Clock, label: "Queued" },
  canceled: { color: "#8a8a8a", Icon: Slash, label: "Canceled" },
};

const SEVERITY_CONFIG: Record<
  "HIGH" | "MEDIUM" | "LOW",
  { color: string; Icon: React.ElementType; label: string }
> = {
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
      style={[styles.badge, { borderColor: color }]}
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
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
