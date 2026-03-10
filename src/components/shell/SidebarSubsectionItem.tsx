import React, { memo } from "react";
import { Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

interface SidebarSubsectionItemProps {
  label: string;
  onPress: () => void;
}

export const SidebarSubsectionItem = memo(function SidebarSubsectionItem({ label, onPress }: SidebarSubsectionItemProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const translatedLabel = t(label);

  return (
    <CustomButton
      onPress={onPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityLabel={translatedLabel}
    >
      <Text style={[styles.label, { color: theme.text.tertiary }]} numberOfLines={1}>
        {translatedLabel}
      </Text>
    </CustomButton>
  );
});

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing[6],
    paddingLeft: spacing[48],
    paddingRight: spacing[16],
    minHeight: 32,
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
  },
});
