import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AlertTriangle size={32} color="#ef4444" />
      <Text style={styles.message}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    minHeight: 200,
  },
  message: {
    fontSize: 14,
    color: "#a3a3a3",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#30a8dc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#00131c",
    fontSize: 14,
    fontWeight: "600",
  },
});
