import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LoadingSkeleton, ErrorState } from "@/components/dashboard";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  loading,
  error,
  onRetry,
  children,
}: ChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {loading ? (
        <LoadingSkeleton variant="chart" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry ?? (() => {})} />
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 10,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  subtitle: {
    fontSize: 12,
    color: "#a3a3a3",
    marginTop: 2,
  },
});
