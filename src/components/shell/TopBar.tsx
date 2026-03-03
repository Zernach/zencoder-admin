import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Modal } from "react-native";
import { Menu, Search, Clock, X } from "lucide-react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import type { TimeRangePreset } from "@/features/analytics/types";
import { useAppDispatch } from "@/store";
import { toggleSidebar } from "@/store/slices/sidebarSlice";
import { useThemeMode } from "@/providers/ThemeProvider";

type SelectableTimeRangePreset = Exclude<TimeRangePreset, "custom">;

const TIME_PRESET_OPTIONS: {
  value: SelectableTimeRangePreset;
  label: string;
  fullLabel: string;
}[] = [
  { value: "24h", label: "24h", fullLabel: "Last 24 hours" },
  { value: "7d", label: "7d", fullLabel: "Last 7 days" },
  { value: "30d", label: "30d", fullLabel: "Last 30 days" },
  { value: "90d", label: "90d", fullLabel: "Last 90 days" },
];

const PRESET_LABELS: Record<TimeRangePreset, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

const PRESET_SHORT_LABELS: Record<TimeRangePreset, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  custom: "Custom",
};

const CONTROL_HORIZONTAL_PADDING = 12;
const CONTROL_VERTICAL_PADDING = 8;
const CONTROL_TEXT_SIZE = 13;
const CONTROL_TEXT_LINE_HEIGHT = 18;

export function TopBar() {
  const breakpoint = useBreakpoint();
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const { preset, setTimeRange } = useDashboardFilters();
  const [isTimeRangeOverlayVisible, setTimeRangeOverlayVisible] = React.useState(false);

  const openTimeRangeOverlay = React.useCallback(
    () => setTimeRangeOverlayVisible(true),
    []
  );

  const closeTimeRangeOverlay = React.useCallback(
    () => setTimeRangeOverlayVisible(false),
    []
  );

  const handleSelectTimeRange = React.useCallback(
    (nextPreset: SelectableTimeRangePreset) => {
      setTimeRange(nextPreset);
      setTimeRangeOverlayVisible(false);
    },
    [setTimeRange]
  );

  const presetButtonLabel =
    breakpoint === "mobile" ? PRESET_SHORT_LABELS[preset] : PRESET_LABELS[preset];
  const isDark = mode === "dark";
  const iconColor = isDark ? "#a3a3a3" : "#435160";
  const panelBackground = isDark ? "#1a1a1a" : "#ffffff";
  const panelBorder = isDark ? "#2d2d2d" : "#d5dce3";
  const barBackground = isDark ? "#0a0a0a" : "#f6f7f8";
  const barBorder = isDark ? "#2d2d2d" : "#d5dce3";
  const textColor = isDark ? "#a3a3a3" : "#435160";
  const placeholderColor = isDark ? "#8a8a8a" : "#6b7683";
  const inputTextColor = isDark ? "#e5e5e5" : "#0f1720";

  return (
    <View style={[styles.container, { backgroundColor: barBackground, borderBottomColor: barBorder }]}>
      <View style={styles.left}>
        {breakpoint !== "mobile" && (
          <Pressable
            onPress={() => dispatch(toggleSidebar())}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Toggle sidebar"
          >
            <Menu size={20} color={iconColor} />
          </Pressable>
        )}
        <View style={[styles.searchContainer, { backgroundColor: panelBackground, borderColor: panelBorder }]}>
          <Search size={14} color={placeholderColor} />
          <TextInput
            style={[styles.searchInput, { color: inputTextColor }]}
            placeholder="Search agents, projects, runs..."
            placeholderTextColor={placeholderColor}
          />
        </View>
      </View>
      <View style={styles.right}>
        <Pressable
          style={[styles.presetBtn, { backgroundColor: panelBackground, borderColor: panelBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Open time range selector"
          onPress={openTimeRangeOverlay}
        >
          <Clock size={14} color={textColor} />
          <Text style={[styles.presetText, { color: textColor }]}>{presetButtonLabel}</Text>
        </Pressable>
      </View>
      <Modal
        transparent
        visible={isTimeRangeOverlayVisible}
        animationType="fade"
        onRequestClose={closeTimeRangeOverlay}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closeTimeRangeOverlay}
            accessibilityRole="button"
            accessibilityLabel="Close time range selector"
          />
          <View style={styles.overlayPanel}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>Select Time Range</Text>
              <Pressable
                onPress={closeTimeRangeOverlay}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close overlay"
              >
                <X size={16} color="#a3a3a3" />
              </Pressable>
            </View>
            <View style={styles.overlayOptions}>
              {TIME_PRESET_OPTIONS.map((option) => {
                const isSelected = preset === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.overlayOptionButton,
                      isSelected && styles.overlayOptionButtonSelected,
                    ]}
                    onPress={() => handleSelectTimeRange(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set time range to ${option.fullLabel}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.overlayOptionText,
                        isSelected && styles.overlayOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: CONTROL_VERTICAL_PADDING,
    flex: 1,
    maxWidth: 400,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: CONTROL_TEXT_SIZE,
    lineHeight: CONTROL_TEXT_LINE_HEIGHT,
    paddingVertical: 0,
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: CONTROL_VERTICAL_PADDING,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetText: {
    fontSize: CONTROL_TEXT_SIZE,
    lineHeight: CONTROL_TEXT_LINE_HEIGHT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  overlayPanel: {
    width: 320,
    maxWidth: "100%",
    backgroundColor: "#111111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2d2d2d",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },
  overlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overlayTitle: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },
  overlayOptions: {
    gap: 8,
  },
  overlayOptionButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2d2d2d",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  overlayOptionButtonSelected: {
    borderColor: "#30a8dc",
    backgroundColor: "rgba(48, 168, 220, 0.13)",
  },
  overlayOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a3a3a3",
  },
  overlayOptionTextSelected: {
    color: "#d6eef8",
  },
});
