import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface SidebarSubsectionItemProps {
  label: string;
  onPress: () => void;
}

export function SidebarSubsectionItem({ label, onPress }: SidebarSubsectionItemProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: theme.text.tertiary }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 6,
    paddingLeft: 48,
    paddingRight: 16,
    minHeight: 32,
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
  },
});
