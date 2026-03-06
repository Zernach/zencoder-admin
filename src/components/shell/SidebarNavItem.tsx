import React, { useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { motion } from "@/theme/motion";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import type { ROUTES } from "@/constants/routes";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  route: ROUTES;
  badge?: number;
  active: boolean;
  expanded: boolean;
  onPress: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  badge,
  active,
  expanded,
  onPress,
}: SidebarNavItemProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const labelOpacity = useSharedValue(expanded ? 1 : 0);
  const labelTranslateX = useSharedValue(expanded ? 0 : -8);

  useEffect(() => {
    labelOpacity.value = withTiming(expanded ? 1 : 0, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
    labelTranslateX.value = withTiming(expanded ? 0 : -8, {
      duration: motion.base,
      easing: Easing.out(Easing.ease),
    });
  }, [expanded, labelOpacity, labelTranslateX]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateX: labelTranslateX.value }],
  }));

  return (
    <CustomButton
      onPress={onPress}
      style={[styles.item, active && { backgroundColor: theme.bg.brandSubtle }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {active && <View style={[styles.activeBorder, { backgroundColor: theme.border.brand }]} />}
      <Icon size={20} color={active ? theme.border.brand : theme.text.secondary} />
      {expanded && (
        <Animated.View style={labelStyle}>
          <Text
            style={[styles.label, { color: active ? theme.text.primary : theme.text.secondary }, active && styles.activeLabelWeight]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Animated.View>
      )}
      {badge != null && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.state.error }]}>
          <Text style={[styles.badgeText, { color: theme.text.onBrand }]}>{badge}</Text>
        </View>
      )}
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 8,
    position: "relative",
  },
  activeBorder: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  activeLabelWeight: {
    fontWeight: "500",
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
