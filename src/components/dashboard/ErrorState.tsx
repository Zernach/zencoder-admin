import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState = React.memo(function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={styles.container}>
      <AlertTriangle size={32} color={theme.state.error} />
      <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
      <CustomButton
        onPress={onRetry}
        style={[styles.button, { backgroundColor: theme.border.brand }]}
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Text style={[styles.buttonText, { color: theme.text.onBrand }]}>Retry</Text>
      </CustomButton>
    </View>
  );
});

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
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
