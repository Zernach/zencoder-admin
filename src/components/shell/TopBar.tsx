import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { spacing, radius } from "@/theme/tokens";

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
const CONTROL_HEIGHT = 36;

export const TopBar = React.memo(function TopBar() {
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

  // Use refs for values that change frequently but shouldn't recreate the callback
  const mostRecentTabRef = useRef(mostRecentTab);
  mostRecentTabRef.current = mostRecentTab;

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setLocalQuery(suggestion.title);
      setSearchQuery(suggestion.title);
      setIsPanelOpen(false);
      const route = buildEntityRoute(mostRecentTabRef.current, suggestion.entityType, suggestion.id);
      setTimeout(() => {
        router.push(route as never);
      }, 0);
    },
    [setSearchQuery, router],
  );

  const autocomplete = useSearchAutocomplete(handleSuggestionSelect);
  const autocompleteRef = useRef(autocomplete);
  autocompleteRef.current = autocomplete;

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalQuery(text);
      autocompleteRef.current.setQuery(text);
      setIsPanelOpen(text.trim().length >= 2);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setLocalQuery("");
    setSearchQuery("");
    autocompleteRef.current.clear();
    setIsPanelOpen(false);
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

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

  // Stable per-preset press handlers to avoid inline closures in .map()
  const timeRangeHandlerCache = useRef(new Map<string, () => void>()).current;
  const handleSelectTimeRangeRef = useRef(handleSelectTimeRange);
  handleSelectTimeRangeRef.current = handleSelectTimeRange;
  const getTimeRangeHandler = useCallback((value: SelectableTimeRangePreset) => {
    let handler = timeRangeHandlerCache.get(value);
    if (!handler) {
      handler = () => handleSelectTimeRangeRef.current(value);
      timeRangeHandlerCache.set(value, handler);
    }
    return handler;
  }, [timeRangeHandlerCache]);

  const presetButtonLabel =
    breakpoint === "mobile" ? PRESET_SHORT_LABELS[preset] : PRESET_LABELS[preset];
  const hasQuery = localQuery.length > 0;

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.bg.canvas, borderBottomColor: theme.border.default }],
    [theme.bg.canvas, theme.border.default],
  );
  const searchContainerStyle = useMemo(
    () => [
      styles.searchContainer,
      { backgroundColor: theme.bg.surface, borderColor: hasQuery ? theme.border.brand : theme.border.default },
    ],
    [theme.bg.surface, theme.border.brand, theme.border.default, hasQuery],
  );
  const presetBtnStyle = useMemo(() => [styles.presetBtn], []);

  return (
    <View style={containerStyle}>
      <View style={styles.left}>
        <View style={searchContainerStyle}>
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
              buttonMode="ghost"
              buttonSize="iconSm"
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
          style={presetBtnStyle}
          buttonMode="surface"
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
                buttonMode="ghost"
                buttonSize="iconSm"
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
                    onPress={getTimeRangeHandler(option.value)}
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
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    borderBottomWidth: 1,
    overflow: "visible",
    zIndex: 200,
    elevation: 200,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    flex: 1,
    overflow: "visible",
    zIndex: 201,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    marginLeft: spacing[12],
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    height: CONTROL_HEIGHT,
    borderRadius: radius.md,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: spacing[0],
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
    minHeight: 0,
    paddingTop: spacing[0],
    paddingBottom: spacing[0],
    paddingVertical: spacing[0],
    paddingHorizontal: spacing[0],
    marginVertical: spacing[0],
  },
  searchInputIos: {
    paddingTop: spacing[0],
    paddingBottom: spacing[0],
  },
  searchInputWrapper: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
  },
  clearButton: {
    marginRight: -spacing[32],
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
    height: CONTROL_HEIGHT,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: spacing[0],
  },
  presetText: {
    fontSize: CONTROL_TEXT_SIZE,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[20],
  },
  overlayPanel: {
    width: 320,
    maxWidth: "100%",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[12],
    paddingTop: spacing[12],
    paddingBottom: spacing[12],
    gap: spacing[12],
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
    gap: spacing[8],
  },
  overlayOptionButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[12],
  },
  overlayOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
