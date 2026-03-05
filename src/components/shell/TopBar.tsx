import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import type { TextInput as TextInputHandle } from "react-native";
import { Search, Clock, X } from "lucide-react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import type { TimeRangePreset } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { AppTextInput } from "@/components/inputs";

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

const DEBOUNCE_MS = 250;
const CONTROL_HORIZONTAL_PADDING = 12;
const CONTROL_VERTICAL_PADDING = 8;
const CONTROL_TEXT_SIZE = 13;
const CONTROL_TEXT_LINE_HEIGHT = 18;

export function TopBar() {
  const breakpoint = useBreakpoint();
  const { mode } = useThemeMode();
  const { preset, setTimeRange, searchQuery, setSearchQuery } = useDashboardFilters();
  const searchInputRef = useRef<TextInputHandle>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTimeRangeOverlayVisible, setTimeRangeOverlayVisible] = useState(false);

  // Sync local state when Redux changes externally (e.g. clearAll)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setSearchQuery(text), DEBOUNCE_MS);
    },
    [setSearchQuery],
  );

  const handleClearSearch = useCallback(() => {
    setLocalQuery("");
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const openTimeRangeOverlay = useCallback(
    () => setTimeRangeOverlayVisible(true),
    [],
  );

  const closeTimeRangeOverlay = useCallback(
    () => setTimeRangeOverlayVisible(false),
    [],
  );

  const handleSelectTimeRange = useCallback(
    (nextPreset: SelectableTimeRangePreset) => {
      setTimeRange(nextPreset);
      setTimeRangeOverlayVisible(false);
    },
    [setTimeRange],
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
  const hasQuery = localQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: barBackground, borderBottomColor: barBorder }]}>
      <View style={styles.left}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: panelBackground, borderColor: hasQuery ? "#30a8dc" : panelBorder },
          ]}
        >
          <Search size={14} color={hasQuery ? "#30a8dc" : placeholderColor} />
          <AppTextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search agents, projects, runs..."
            value={localQuery}
            onChangeText={handleSearchChange}
            accessibilityLabel="Search"
            accessibilityHint="Filter dashboard data by keyword"
          />
          {hasQuery && (
            <Pressable
              onPress={handleClearSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.clearButton}
            >
              <X size={14} color={iconColor} />
            </Pressable>
          )}
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
    marginLeft: 12,
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
  clearButton: {
    padding: 2,
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
