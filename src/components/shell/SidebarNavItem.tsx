import React, { useEffect } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { motion } from "@/theme/motion";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
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
    <Pressable
      onPress={onPress}
      style={[styles.item, active && styles.active]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {active && <View style={styles.activeBorder} />}
      <Icon size={20} color={active ? "#30a8dc" : "#a3a3a3"} />
      {expanded && (
        <Animated.View style={labelStyle}>
          <Text
            style={[styles.label, active && styles.activeLabel]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Animated.View>
      )}
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
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
  active: {
    backgroundColor: "rgba(48, 168, 220, 0.1)",
  },
  activeBorder: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: "#30a8dc",
    borderRadius: 2,
  },
  label: {
    fontSize: 14,
    color: "#a3a3a3",
    flex: 1,
  },
  activeLabel: {
    color: "#e5e5e5",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});
