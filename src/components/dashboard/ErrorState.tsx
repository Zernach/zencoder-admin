import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { AlertTriangle } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  fullScreen?: boolean;
  showHomeButton?: boolean;
  onGoHome?: () => void;
}

export const ErrorState = React.memo(function ErrorState({
  title,
  message,
  onRetry,
  fullScreen = false,
  showHomeButton = false,
  onGoHome,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const displayTitle = title ?? t("errors.title");
  const displayMessage = message ?? t("errors.somethingWentWrong");

  return (
    <View style={[styles.container, fullScreen && styles.fullScreenContainer]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.default,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: theme.bg.subtle,
              borderColor: theme.border.subtle,
            },
          ]}
        >
          <AlertTriangle size={28} color={theme.state.error} />
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>{displayTitle}</Text>
        <Text style={[styles.message, { color: theme.text.secondary }]}>{displayMessage}</Text>
        <View style={styles.actions}>
          <CustomButton
            onPress={onRetry}
            style={styles.actionButton}
            buttonMode="primary"
            buttonSize="md"
            label={t("common.retry")}
            accessibilityRole="button"
            accessibilityLabel={t("common.retry")}
          />
          {showHomeButton && onGoHome ? (
            <CustomButton
              onPress={onGoHome}
              style={styles.actionButton}
              buttonMode="secondary"
              buttonSize="md"
              label={t("navigation.home")}
              accessibilityRole="button"
              accessibilityLabel={t("navigation.home")}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[24],
    minHeight: 200,
  },
  fullScreenContainer: {
    flex: 1,
    alignSelf: "stretch",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[24],
    alignItems: "center",
    gap: spacing[12],
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actions: {
    marginTop: spacing[8],
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing[10],
  },
  actionButton: {
    minWidth: 132,
  },
});
