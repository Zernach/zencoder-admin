import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

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
        style={styles.button}
        buttonMode="primary"
        buttonSize="md"
        label="Retry"
        accessibilityRole="button"
        accessibilityLabel="Retry"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[32],
    gap: spacing[12],
    minHeight: 200,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    marginTop: spacing[16],
  },
});
