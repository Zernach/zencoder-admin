import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { CustomButton } from "@/components/buttons";
import type { TextInput as TextInputHandle } from "react-native";
import { Search, Clock, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { useSearchAutocomplete } from "@/features/analytics/hooks/useSearchAutocomplete";
import type { TimeRangePreset, SearchSuggestion } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { CustomTextInput } from "@/components/inputs";
import { SearchAutocompletePanel } from "@/components/search";
import { buildEntityRoute } from "@/constants/routes";
import { isIos } from "@/constants";
import { useAppSelector, selectMostRecentTab } from "@/store";

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
const CONTROL_TEXT_SIZE = 13;
const CONTROL_TEXT_LINE_HEIGHT = 20;
const CONTROL_HEIGHT = 36;

export function TopBar() {
  const breakpoint = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const router = useRouter();
  const mostRecentTab = useAppSelector(selectMostRecentTab);
  const { preset, setTimeRange, searchQuery, setSearchQuery } = useDashboardFilters();
  const searchInputRef = useRef<TextInputHandle>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isTimeRangeOverlayVisible, setTimeRangeOverlayVisible] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setLocalQuery(suggestion.title);
      setSearchQuery(suggestion.title);
      setIsPanelOpen(false);
      const route = buildEntityRoute(mostRecentTab, suggestion.entityType, suggestion.id);
      setTimeout(() => {
        router.push(route as never);
      }, 0);
    },
    [setSearchQuery, mostRecentTab, router],
  );

  const autocomplete = useSearchAutocomplete(handleSuggestionSelect);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalQuery(text);
      autocomplete.setQuery(text);
      setIsPanelOpen(text.trim().length >= 2);
    },
    [autocomplete],
  );

  const handleClearSearch = useCallback(() => {
    setLocalQuery("");
    setSearchQuery("");
    autocomplete.clear();
    setIsPanelOpen(false);
    searchInputRef.current?.focus();
  }, [setSearchQuery, autocomplete]);

  const handleDismissPanel = useCallback(() => {
    setIsPanelOpen(false);
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
  const hasQuery = localQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg.canvas, borderBottomColor: theme.border.default }]}>
      <View style={styles.left}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.bg.surface, borderColor: hasQuery ? theme.border.brand : theme.border.default },
          ]}
        >
          <Search size={14} color={hasQuery ? theme.border.brand : theme.text.tertiary} />
          <CustomTextInput
            ref={searchInputRef}
            containerStyle={styles.searchInputWrapper}
            showInputContainer={false}
            style={[styles.searchInput, isIos ? styles.searchInputIos : undefined]}
            placeholder="Search agents, projects, runs..."
            value={localQuery}
            onChangeText={handleSearchChange}
            accessibilityLabel="Search"
            accessibilityHint="Filter dashboard data by keyword"
          />
          {hasQuery && (
            <CustomButton
              onPress={handleClearSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.clearButton}
            >
              <X size={14} color={theme.icon.secondary} />
            </CustomButton>
          )}
          <SearchAutocompletePanel
            suggestions={autocomplete.suggestions}
            loading={autocomplete.loading}
            error={autocomplete.error}
            onSelect={autocomplete.selectSuggestion}
            onDismiss={handleDismissPanel}
            visible={isPanelOpen}
          />
        </View>
      </View>
      <View style={styles.right}>
        <CustomButton
          style={[styles.presetBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}
          accessibilityRole="button"
          accessibilityLabel="Open time range selector"
          onPress={openTimeRangeOverlay}
        >
          <Clock size={14} color={theme.text.secondary} />
          <Text
            allowFontScaling={false}
            style={[styles.presetText, { color: theme.text.secondary }]}
          >
            {presetButtonLabel}
          </Text>
        </CustomButton>
      </View>
      <Modal
        transparent
        visible={isTimeRangeOverlayVisible}
        animationType="fade"
        onRequestClose={closeTimeRangeOverlay}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.bg.overlay }]}>
          <CustomButton
            style={StyleSheet.absoluteFillObject}
            onPress={closeTimeRangeOverlay}
            accessibilityRole="button"
            accessibilityLabel="Close time range selector"
          />
          <View style={[styles.overlayPanel, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}>
            <View style={styles.overlayHeader}>
              <Text style={[styles.overlayTitle, { color: theme.text.primary }]}>Select Time Range</Text>
              <CustomButton
                onPress={closeTimeRangeOverlay}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close overlay"
              >
                <X size={16} color={theme.text.secondary} />
              </CustomButton>
            </View>
            <View style={styles.overlayOptions}>
              {TIME_PRESET_OPTIONS.map((option) => {
                const isSelected = preset === option.value;
                return (
                  <CustomButton
                    key={option.value}
                    style={[
                      styles.overlayOptionButton,
                      { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
                      isSelected && { borderColor: theme.border.brand, backgroundColor: theme.bg.brandSubtle },
                    ]}
                    onPress={() => handleSelectTimeRange(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set time range to ${option.fullLabel}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.overlayOptionText,
                        { color: theme.text.secondary },
                        isSelected && { color: theme.text.brand },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </CustomButton>
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
    position: "relative",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    overflow: "visible",
    zIndex: 200,
    elevation: 200,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    overflow: "visible",
    zIndex: 201,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: CONTROL_HEIGHT,
    borderRadius: 8,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: 0,
    flex: 1,
    maxWidth: 400,
    borderWidth: 1,
    overflow: "visible",
    zIndex: 202,
    elevation: 202,
  },
  searchInput: {
    flex: 1,
    fontSize: CONTROL_TEXT_SIZE,
    lineHeight: CONTROL_TEXT_LINE_HEIGHT,
    height: CONTROL_TEXT_LINE_HEIGHT,
    minHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
  },
  searchInputIos: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  searchInputWrapper: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
  },
  clearButton: {
    padding: 2,
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: CONTROL_HEIGHT,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: 0,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetText: {
    fontSize: CONTROL_TEXT_SIZE,
    lineHeight: CONTROL_TEXT_LINE_HEIGHT,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  overlayPanel: {
    width: 320,
    maxWidth: "100%",
    borderRadius: 14,
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: "600",
  },
  overlayOptions: {
    gap: 8,
  },
  overlayOptionButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  overlayOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
