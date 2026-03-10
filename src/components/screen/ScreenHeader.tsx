import React from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";
import { isWeb } from "@/constants/platform";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Direct loading boolean -- shows spinner when true */
  isLoading?: boolean;
  /** Element rendered on the right side of the header row */
  rightComponent?: ReactNode;
}

const ScreenHeader = React.memo(function ScreenHeader({
  title,
  subtitle,
  isLoading,
  rightComponent,
}: HeaderProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const router = useRouter();
  const navigation = useNavigation();
  const showBack = !isWeb && navigation.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <ChevronLeft size={24} color={theme.text.primary} />
          </Pressable>
        )}
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.border.brand}
            style={styles.spinner}
            accessibilityLabel="Loading"
          />
        )}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.text.secondary }]} numberOfLines={1} ellipsizeMode="tail">
          {subtitle}
        </Text>
      )}
      {rightComponent != null && (
        <View style={styles.right}>{rightComponent}</View>
      )}
    </View>
  );
});

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
    minHeight: 48,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[10],
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
  },
  right: {
    marginTop: spacing[4],
  },
  backButton: {
    marginRight: spacing[4],
  },
  backButtonPressed: {
    opacity: 0.4,
  },
  spinner: {
    marginLeft: spacing[4],
  },
});
